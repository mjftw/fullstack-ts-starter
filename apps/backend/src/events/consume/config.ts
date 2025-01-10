import {
  ACK_MESSAGE,
  type RabbitMQConsumersConfig,
} from "@multiverse-io/events-tooling-ts";
import { defaultDeadLetterConfig } from "@multiverse-io/events-tooling-ts";
import { ConsumerCtx } from "./ctx";
import { handleAccountChangelogV2 } from "./handlers/exampleConsumer/accountChangelogV2";
import { handleCompanyCreatedV1 } from "./handlers/exampleConsumer2/companyCreatedV1";
import { Logger as MVLogger } from "@multiverse-io/logger";

function createConsumerConfig({ env, logger }: {
  env: {
    RABBITMQ_HOST: string;
    RABBITMQ_PORT: number;
    RABBITMQ_USERNAME: string;
    RABBITMQ_PASSWORD: string;
    RABBITMQ_REQUIRE_TLS: boolean;
    RABBITMQ_CREATE_CONSUMER_EXCHANGES: boolean;
  },
  ctx: ConsumerCtx,
  logger: MVLogger
}): RabbitMQConsumersConfig<ConsumerCtx> {
  return {
    rabbitMQ: {
      host: env.RABBITMQ_HOST,
      port: env.RABBITMQ_PORT,
      username: env.RABBITMQ_USERNAME,
      password: env.RABBITMQ_PASSWORD,
      // `vhost` is not specified here, so the default vhost "/" will be used
      // By default we use AMQPS, but for development purposes we can disable TLS
      requireTLS: env.RABBITMQ_REQUIRE_TLS,
    },
    logger,
    createConsumerExchanges: env.RABBITMQ_CREATE_CONSUMER_EXCHANGES, // This should always be false in production!
    consumers: {
      "example-consumer": {
        prefetchCount: 2,
        // Checkout - https://coda.io/d/_daQaM_fX8Uq/RabbitMQ-Conventions_suxHYF_K#_luhjKMh6 for queue naming conventions
        queueName: "guidance_hub.accounts_company_updates_events.queue",
        bindings: {
          "account.changelog": {
            v2: {
              routingKey: "account.changelog",
              exchangeName: "account_exchange",
              eventHandler: handleAccountChangelogV2,
            },
          },
          "company.updated": {
            v1: {
              routingKey: "company.updated",
              exchangeName: "company_exchange",
              eventHandler: async (event) => {
                console.log("Handling company.updated", event);
                return ACK_MESSAGE;
              },
            },
          },
        },
      },
      "example-consumer-2": {
        deadLetter: defaultDeadLetterConfig(),
        // Checkout - https://coda.io/d/_daQaM_fX8Uq/RabbitMQ-Conventions_suxHYF_K#_luhjKMh6 for queue naming conventions
        queueName: "guidance_hub.company_created_events.queue",
        bindings: {
          "company.created": {
            v1: {
              routingKey: "company.created",
              exchangeName: "company_exchange",
              eventHandler: handleCompanyCreatedV1,
            },
          },
        },
      },
    },
  };
}

export { createConsumerConfig };
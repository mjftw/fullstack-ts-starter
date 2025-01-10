import {
  REJECT_MESSAGE,
  RETRY_MESSAGE,
} from "@multiverse-io/events-tooling-ts";

import type { EventHandler } from "@multiverse-io/events-tooling-ts";
import { ConsumerCtx } from "../../ctx";

export const handleAccountChangelogV2: EventHandler<
  "account.changelog",
  "v2",
  ConsumerCtx
> = async (event, cloudEvent, rawMessage, ctx) => {
  ctx.logger.info({
    message:
      "We can access the event with the decoded message payload excluding the envelope",
    event,
  });
  ctx.logger.info({
    message:
      "We can access the full cloud event with the full message envelope",
    cloudEvent,
  });
  ctx.logger.info({
    message: "We can access the raw message with the original AMQP message",
    rawMessage: { exchange: rawMessage.exchange, routingKey: rawMessage.routingKey, deliveryTag: rawMessage.deliveryTag, properties: rawMessage.properties },
  });
  const randomNumber = Math.random();
  ctx.logger.info({ message: "Handling account.changelog", event });
  if (randomNumber > 0.9) {
    ctx.logger.info("Better luck next time...");
    return REJECT_MESSAGE;
  } else if (randomNumber > 0.5) {
    ctx.logger.info("Let's try that again");
    return RETRY_MESSAGE;
  } else {
    ctx.logger.info("You got lucky this time...");
  }
};

import { ACK_MESSAGE } from "@multiverse-io/events-tooling-ts";

import type { EventHandler } from "@multiverse-io/events-tooling-ts";
import { ConsumerCtx } from "~/events/consume/ctx";

export const handleCompanyCreatedV1: EventHandler<
  "company.created",
  "v1",
  ConsumerCtx
> = async (event, _cloudEvent, _rawMessage, ctx) => {
  // In this example we use the logger object passed in as context
  // This is a simple example, but in a real-world application you might want to pass in other context
  ctx.logger.info(`Handling company.created V1 event with ID: ${event.id}`);
  return ACK_MESSAGE;
};

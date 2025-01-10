import { ACK_MESSAGE } from "@multiverse-io/events-tooling-ts";

import type { EventHandler } from "@multiverse-io/events-tooling-ts";
import { ConsumerCtx } from "../../ctx";

export const handleCompanyUpdatedV1: EventHandler<
  "company.updated",
  "v1",
  ConsumerCtx
> = async (event, _cloudEvent, _rawMessage, ctx) => {
  ctx.logger.info(`Handling company.updated V1 event with ID: ${event.id}`);
  return ACK_MESSAGE;
};

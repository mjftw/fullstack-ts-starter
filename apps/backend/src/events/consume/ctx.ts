import { Services } from "~/services/services.module";
import { Logger as MVLogger } from "@multiverse-io/logger";
/** 
 * Context object passed to event handlers
 */
export type ConsumerCtx = {
  services: Services,
  logger: MVLogger
}

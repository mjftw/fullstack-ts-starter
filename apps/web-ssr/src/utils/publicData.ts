import { z } from "zod";

export const serverPublicDataSchema = z.object({
  FOO: z.string(),
  BAR: z.number(),
});

export type ServerPublicData = z.infer<typeof serverPublicDataSchema>;

export function parseServerPublicData(data: unknown): ServerPublicData {
  return serverPublicDataSchema.parse(data);
}

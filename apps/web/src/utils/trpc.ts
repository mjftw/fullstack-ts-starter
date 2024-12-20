import { createTRPCReact } from "@trpc/react-query";
//Fixme: Import from shared package
import type { AppRouter } from "../../../api/src/trpc/routers";

export const trpc = createTRPCReact<AppRouter>();

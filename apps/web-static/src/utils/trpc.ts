import { createTRPCReact } from "@trpc/react-query";

/* Here we import the AppRouter type directly from the backend package.
 * This would usually be a bad thing to do, but we are only importing the type
 * and not the implementation, so this will not affect the build, only type checking in local dev.
 *
 * This works as `tsconfig.app.json` has a project reference to `apps/backend/tsconfig.types.json`,
 * allowing path imports from source files in the backend project to work.
 * E.g. A source file importing from `src/trpc/routers` will correctly resolve the path alias src,
 * as mentioned in the tsconfig.types.json file.
 *
 * We also have a `@backend/*` path alias in the tsconfig.json file, which allows us to import from the
 * backend package a little more cleanly here.
 *
 * However, we should never use this method to import anything except for types,
 * as it will break the build!
 */

import type { AppRouter } from "@backend/trpc/routers";

export const trpc = createTRPCReact<AppRouter>();

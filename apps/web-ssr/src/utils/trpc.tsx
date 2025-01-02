import { createTRPCReact } from "@trpc/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";

/* Here we import the AppRouter type directly from the api package.
 * This would usually be a bad thing to do, but we are only importing the type
 * and not the implementation, so this will not affect the build, only type checking in local dev.
 *
 * This works as `tsconfig.app.json` has a project reference to `apps/api/tsconfig.types.json`,
 * allowing path imports from source files in the api project to work.
 * E.g. A source file importing from `src/trpc/routers` will correctly resolve the path alias src,
 * as mentioned in the tsconfig.types.json file.
 *
 * We also have a `@api/*` path alias in the tsconfig.json file, which allows us to import from the
 * api package a little more cleanly here.
 *
 * However, we should never use this method to import anything except for types,
 * as it will break the build!
 */
import type { AppRouter } from "@api/trpc/routers";

/** Used to create hooks for tRPC queries and mutations */
export const trpc = createTRPCReact<AppRouter>();

/** Used to wrap the app to allow using tRPC hooks */
export function TRPCProvider({
  children,
  apiURL,
}: {
  children: React.ReactNode;
  apiURL: string;
}) {
  const queryClient = new QueryClient();
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: apiURL,
      }),
    ],
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

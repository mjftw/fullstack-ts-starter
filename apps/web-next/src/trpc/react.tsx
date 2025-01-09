"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
// import SuperJSON from "superjson";

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


import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/** Used to create hooks for tRPC queries and mutations */
export const trpc = createTRPCReact<AppRouter>();

export function TRPCReactProvider({
  children,
  apiURL,
}: {
  children: React.ReactNode;
  apiURL: string;
}) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          // transformer: SuperJSON,
          url: apiURL,
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}

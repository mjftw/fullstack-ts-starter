import React, { createContext, useContext, ReactNode } from "react";
import { z } from "zod";

export const configSchema = z.object({
  FOO: z.string(),
  BAR: z.number(),
});

export type Config = z.infer<typeof configSchema>;

export function parseConfig(data: unknown): Config {
  return configSchema.parse(data);
}

const ConfigContext = createContext<Config | undefined>(undefined);

/**
 * This context parses configuration data from the window object that was injected during SSR.
 *
 * It is used to pass configuration such as public API URLs from the server to the client.
 */
export const ConfigProvider: React.FC<{
  children: ReactNode;
  data: unknown;
}> = ({ children, data }) => {
  const serverData = parseConfig(data);

  return (
    <ConfigContext.Provider value={serverData}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): Config => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};

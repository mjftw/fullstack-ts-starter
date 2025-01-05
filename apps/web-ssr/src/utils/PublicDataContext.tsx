import React, { createContext, useContext, ReactNode } from "react";
import { type ServerPublicData, parseServerPublicData } from "./publicData";

const ServerPublicDataContext = createContext<ServerPublicData | undefined>(
  undefined
);

/**
 * This context parses configuration data from the window object that was injected during SSR.
 *
 * It is used to pass configuration such as public API URLs from the server to the client.
 */
export const ServerPublicDataProvider: React.FC<{
  children: ReactNode;
  windowDataKey?: string;
}> = ({ children, windowDataKey = "__PUBLIC_SSR_DATA__" }) => {
  const rawData = (window as any)[windowDataKey];
  if (!rawData) {
    throw new Error(
      `Server configuration data not found in window object with key '${windowDataKey}'`
    );
  }
  const serverData = parseServerPublicData(rawData);

  return (
    <ServerPublicDataContext.Provider value={serverData}>
      {children}
    </ServerPublicDataContext.Provider>
  );
};

export const useServerPublicData = (): ServerPublicData => {
  const context = useContext(ServerPublicDataContext);
  if (context === undefined) {
    throw new Error(
      "useServerPublicData must be used within a ServerPublicDataProvider"
    );
  }
  return context;
};

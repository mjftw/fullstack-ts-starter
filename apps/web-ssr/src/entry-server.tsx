import { StrictMode } from "react";
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { TRPCProvider } from "./utils/trpc";
import App from "./App";
import { ServerPublicDataProvider } from "./utils/PublicDataContext";

export function render(url: string, options?: RenderToPipeableStreamOptions) {
  return renderToPipeableStream(
    <StrictMode>
      <ServerPublicDataProvider>
        <TRPCProvider apiURL="">
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </TRPCProvider>
      </ServerPublicDataProvider>
    </StrictMode>,
    options
  );
}

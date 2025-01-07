import { StrictMode } from "react";
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { TRPCProvider } from "./utils/trpc";
import App from "./App";
import { ConfigProvider } from "./utils/ConfigContext";

export function render(
  url: string,
  config: Record<string, unknown>,
  options?: RenderToPipeableStreamOptions
) {
  return renderToPipeableStream(
    <StrictMode>
      <ConfigProvider data={config}>
        <TRPCProvider apiURL="">
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </TRPCProvider>
      </ConfigProvider>
    </StrictMode>,
    options
  );
}

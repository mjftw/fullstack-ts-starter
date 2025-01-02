import { StrictMode } from "react";
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { TRPCProvider } from "./utils/trpc";
import App from "./App";

export function render(url: string, options?: RenderToPipeableStreamOptions) {
  return renderToPipeableStream(
    <StrictMode>
      <TRPCProvider apiURL="http://localhost:80/api/trpc">
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </TRPCProvider>
    </StrictMode>,
    options
  );
}

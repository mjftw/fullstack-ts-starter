import { StrictMode } from "react";
import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import App from "./App";
import { TRPCProvider } from "./utils/trpc";

export function render(_url: string, options?: RenderToPipeableStreamOptions) {
  return renderToPipeableStream(
    <StrictMode>
      <TRPCProvider apiURL="http://localhost:3000/api/trpc">
        <App />
      </TRPCProvider>
    </StrictMode>,
    options
  );
}

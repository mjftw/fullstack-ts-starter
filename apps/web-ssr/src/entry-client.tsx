import "./index.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TRPCProvider } from "./utils/trpc";
import { ConfigProvider } from "./utils/ConfigContext";
import App from "./App";

hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <StrictMode>
    <ConfigProvider data={(window as any).__PUBLIC_SSR_DATA__}>
      {/* TODO: GET API URL FROM CONFIG */}
      <TRPCProvider apiURL="http://localhost:80/api/trpc">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TRPCProvider>
    </ConfigProvider>
  </StrictMode>
);

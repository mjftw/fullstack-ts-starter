import "./index.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { TRPCProvider } from "./utils/trpc";
import App from "./App";

hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <StrictMode>
    <TRPCProvider apiURL="http://localhost:80/api/trpc">
      <App />
    </TRPCProvider>
  </StrictMode>
);
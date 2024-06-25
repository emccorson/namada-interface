import { init as initShared } from "@namada/shared/src/init-inline";
import { SdkProvider } from "hooks/useSdk";
import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { StoreProvider } from "store";
import { getRouter } from "./App/AppRoutes";
import { ExtensionEventsProvider, IntegrationsProvider } from "./services";

import "@namada/components/src/base.css";
import "./tailwind.css";

// TODO: we could show the loading screen while initShared is pending
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  initShared().then(() => {
    root.render(
      <React.StrictMode>
        <StoreProvider>
          <IntegrationsProvider>
            <SdkProvider>
              <ExtensionEventsProvider>
                <RouterProvider router={getRouter()} />
              </ExtensionEventsProvider>
            </SdkProvider>
          </IntegrationsProvider>
        </StoreProvider>
      </React.StrictMode>
    );
  });
}

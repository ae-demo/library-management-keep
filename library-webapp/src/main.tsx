import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Component styles come from the astryxStylex() Vite plugin's build-time
// extraction (vite.config.ts), not a precompiled core CSS bundle — only the
// reset and the active theme's tokens are loaded as plain CSS here, per the
// astryx-design-system skill's Setup section.
import "@astryxdesign/core/reset.css";
import "@astryxdesign/theme-neutral/theme.css";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme theme={neutralTheme} mode="system">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Theme>
  </StrictMode>,
);

// @refresh reload
import { SolidBaseRoot } from "@kobalte/solidbase/client";
import { DefaultThemeComponentsProvider } from "@kobalte/solidbase/default-theme/context";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import SiteFooter from "~/components/SiteFooter";
import "./app.css";

export default function App() {
  return (
    <DefaultThemeComponentsProvider components={{ Footer: SiteFooter }}>
      <Router root={SolidBaseRoot}>
        <FileRoutes />
      </Router>
    </DefaultThemeComponentsProvider>
  );
}

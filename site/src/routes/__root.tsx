/// <reference types="vite/client" />
import { ErrorBoundary, type ParentProps, Suspense } from "solid-js";
import { HydrationScript } from "solid-js/web";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/solid-router";

import "../app.scss";

import Header from "../components/Header/Header.js";
import SolidBlocksHeaderClusterDefs from "../components/Icons/SolidBlocksHeaderClusterDefs.js";
import Footer from "../components/Footer/Footer.js";
import NotFound from "../components/NotFound.js";

const SITE_URL = import.meta.env.VITE_SITE_URL;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Solid Primitives" },
      {
        name: "description",
        content: "A library of high-quality primitives that extend SolidJS reactivity",
      },
      { name: "og:url", content: SITE_URL },
      { name: "og:type", content: "website" },
      { name: "og:image:width", content: "1200" },
      { name: "og:image:height", content: "600" },
      { name: "og:image", content: `${SITE_URL}/og.jpeg` },
      { name: "og:image:url", content: `${SITE_URL}/og.jpeg` },
      { name: "og:image:secure_url", content: `${SITE_URL}/og.jpeg` },
      { name: "og:image:alt", content: "" },
      { name: "twitter:title", content: "Solid Primitives" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/og.jpeg` },
      { name: "twitter:image:alt", content: "" },
      {
        name: "twitter:description",
        content: "A library of high-quality primitives that extend SolidJS reactivity",
      },
      { name: "msapplication-TileImage", content: "/favicons/ms-icon-144x144.png" },
      { name: "msapplication-TileColor", content: "#2c4f7c" },
      { name: "theme-color", content: "#2c4f7c" },
    ],
    links: [
      { rel: "apple-touch-icon", sizes: "180x180", href: "/favicons/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicons/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicons/favicon-16x16.png" },
      { rel: "icon", type: "image/png", href: "/favicons/favicon-32x32.png" },
    ],
    scripts: [
      {
        children: `
          if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        `,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument(props: ParentProps) {
  return (
    <html lang="en" data-html>
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body class="dark:text-[#F1F0F2]">
        <Suspense>
          <ErrorBoundary fallback={err => <div>Error: {String(err)}</div>}>
            <div id="root">
              <Header />
              <div id="root-subcontainer" class="md:overflow-x-clip">
                <SolidBlocksHeaderClusterDefs />
                {props.children}
                <Footer />
              </div>
            </div>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </body>
    </html>
  );
}

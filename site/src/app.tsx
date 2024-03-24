// @refresh reload
import { ErrorBoundary, ParentProps, Suspense } from "solid-js";

import "./app.scss";

import Header from "./components/Header/Header.js";
import SolidBlocksHeaderClusterDefs from "./components/Icons/SolidBlocksHeaderClusterDefs.js";
import Footer from "./components/Footer/Footer.js";
import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import DocumentHydrationHelper from "./primitives/DocumentHydrationHelper.jsx";

const SITE_URL = import.meta.env.VITE_SITE_URL;

export default function Root() {

  return (<Router
    root={props => (
      <MetaProvider>
        <RootContent>
          {props.children}
        </RootContent>
      </MetaProvider>
    )}
  >
    <FileRoutes />
  </Router>);
}

function RootContent(props: ParentProps) {
  return (
    <html lang="en" data-html>
    <head>
      <title>Solid Primitives</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="og:url" content={SITE_URL} />
      <meta name="og:type" content="website" />
      <meta
        name="description"
        content="A library of high-quality primitives that extend SolidJS reactivity"
      />
      <meta name="og:image:width" content="1200" />
      <meta name="og:image:height" content="600" />
      <meta name="og:image" content={`${SITE_URL}/og.jpeg`} />
      <meta name="og:image:url" content={`${SITE_URL}/og.jpeg`} />
      <meta name="og:image:secure_url" content={`${SITE_URL}/og.jpeg`} />
      <meta name="og:image:alt" content="" />
      <meta name="twitter:title" content="Solid Primitives" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={`${SITE_URL}/og.jpeg`} />
      <meta name="twitter:image:alt" content="" />
      <meta
        name="twitter:description"
        content="A library of high-quality primitives that extend SolidJS reactivity"
      />
      <link rel="apple-touch-icon" sizes="180x180" href={`/favicons/apple-touch-icon.png`} />
      <link rel="icon" type="image/png" sizes="32x32" href={`/favicons/favicon-32x32.png`} />
      <link rel="icon" type="image/png" sizes="16x16" href={`/favicons/favicon-16x16.png`} />
      <meta name="msapplication-TileImage" content={`/favicons/ms-icon-144x144.png`} />
      <meta name="msapplication-TileColor" content="#2c4f7c" />
      <meta name="theme-color" content="#2c4f7c" />
      <meta name="msapplication-TileColor" content="#2c4f7c" />
      <meta name="theme-color" content="#2c4f7c" />
      <link rel="icon" type="image/png" href={`/favicons/favicon-32x32.png`} />
      <script
        innerHTML={`
          if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          `}
      ></script>
      <DocumentHydrationHelper />
    </head>
    <body class="dark:text-[#F1F0F2]">
    <Suspense>
      <ErrorBoundary>
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
    </body>
    </html>
  );
}

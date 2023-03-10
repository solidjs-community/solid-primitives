// @refresh reload
import { onMount, Suspense } from "solid-js";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import { isServer } from "solid-js/web";
import { debounce } from "@solid-primitives/scheduled";

import "./root.scss";

import Header from "./components/Header/Header";
import SolidBlocksHeaderClusterDefs from "./components/Icons/SolidBlocksHeaderClusterDefs";
import Footer from "./components/Footer/Footer";

let url = "";
if (isServer) {
  const { SITE_URL } = process.env;
  url = SITE_URL!;
}

export default function Root() {
  // Primitives/Table.tsx produces a lot of hydration warnings in development mode.
  if (import.meta.env.MODE === "development" && !isServer) {
    const keys: string[] = [];
    const cw = console.warn;
    console.warn = (...args) => {
      if (args[0] === "Unable to find DOM nodes for hydration key:") {
        keys.push(args[1]);
        logStoredWarnings();
      } else cw(...args);
    };
    const logStoredWarnings = debounce(() => {
      console.groupCollapsed(`There were ${keys.length} hydration warnings.`);
      keys.forEach(key => cw("Unable to find DOM nodes for hydration key:", key));
      console.groupEnd();
      keys.length = 0;
    }, 1000);
  }

  return (
    <Html lang="en" data-html>
      <Head>
        <Title>Solid Primitives</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta name="og:url" content={url} />
        <Meta name="og:type" content="website" />
        <Meta
          name="description"
          content="A library of high-quality primitives that extend SolidJS reactivity"
        />
        <Meta name="og:image:width" content="1200" />
        <Meta name="og:image:height" content="600" />
        <Meta name="og:image" content={`${url}/og.jpeg`} />
        <Meta name="og:image:url" content={`${url}/og.jpeg`} />
        <Meta name="og:image:secure_url" content={`${url}/og.jpeg`} />
        <Meta name="og:image:alt" content="" />
        <Meta name="twitter:title" content="Solid Primitives" />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:image" content={`${url}/og.jpeg`} />
        <Meta name="twitter:image:alt" content="" />
        <Meta
          name="twitter:description"
          content="A library of high-quality primitives that extend SolidJS reactivity"
        />
        <Link rel="apple-touch-icon" sizes="180x180" href={`/favicons/apple-touch-icon.png`} />
        <Link rel="icon" type="image/png" sizes="32x32" href={`/favicons/favicon-32x32.png`} />
        <Link rel="icon" type="image/png" sizes="16x16" href={`/favicons/favicon-16x16.png`} />
        <Meta name="msapplication-TileImage" content={`/favicons/ms-icon-144x144.png`} />
        <Meta name="msapplication-TileColor" content="#2c4f7c" />
        <Meta name="theme-color" content="#2c4f7c" />
        <Meta name="msapplication-TileColor" content="#2c4f7c" />
        <Meta name="theme-color" content="#2c4f7c" />
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
      </Head>
      <Body class="dark:text-[#F1F0F2]">
        <Suspense>
          <ErrorBoundary>
            <div id="root">
              <Header />
              <div id="root-subcontainer" class="md:overflow-x-clip">
                <SolidBlocksHeaderClusterDefs />
                <Routes>
                  <FileRoutes />
                </Routes>
                <Footer />
              </div>
            </div>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}

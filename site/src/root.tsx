// @refresh reload
import { Suspense } from "solid-js";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title
} from "solid-start";
import Header from "./components/Header/Header";
import "./root.css";
import SolidBlocksHeaderClusterDefs from "./components/Icons/SolidBlocksHeaderClusterDefs";
import Footer from "./components/Footer/Footer";

export default function Root() {
  return (
    <Html lang="en" data-html>
      <Head>
        <Title>Solid Primitives</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
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
            <Header />
            <SolidBlocksHeaderClusterDefs />
            <Routes>
              <FileRoutes />
            </Routes>
            <Footer />
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}

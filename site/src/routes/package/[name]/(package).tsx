import { Component, createMemo, createResource, onMount, Suspense } from "solid-js";
import { fetchPackageData, getCachedPackageListItemData } from "~/api.js";
import { PRIMITIVE_PAGE_PADDING_TOP } from "~/components/Header/Header.jsx";
import InfoBar from "~/components/Primitives/InfoBar.jsx";
import { H2 } from "~/components/prose.jsx";
import { pageWidthClass } from "~/constants.js";
import { DocumentClass } from "~/primitives/document-class.jsx";
import { PackageData } from "~/types.js";
import { kebabCaseToCapitalized } from "~/utils.js";
import { Heading } from "./components/heading.js";
import { PackageInstallation } from "./components/package-installation.js";
import { createPrimitiveNameTooltips } from "./components/primitive-name-tooltips.js";
import { useParams } from "@solidjs/router";
import { Title } from "@solidjs/meta";

type Params = {
  name: string;
};

export function routeData() {}

const Page: Component = () => {
  const params = useParams<Params>();

  const cachedData = createMemo(() => getCachedPackageListItemData(params.name));

  const [dataResource] = createResource<PackageData, string>(() => params.name, fetchPackageData);

  const data = {
    get name() {
      return params.name;
    },
    get version() {
      return cachedData()?.version ?? dataResource()?.version;
    },
    get packageSize() {
      return cachedData()?.packageSize ?? dataResource()?.packageSize;
    },
    get primitives() {
      return cachedData()?.primitives ?? dataResource()?.primitives;
    },
    get stage() {
      return cachedData()?.stage ?? dataResource()?.stage;
    },
    get readme() {
      return dataResource()?.readme;
    },
  };

  const packageName = () => `@solid-primitives/${data.name}`;
  const formattedName = createMemo(() => kebabCaseToCapitalized(data.name));

  return (
    <>
      <Title>{formattedName()} — Solid Primitives</Title>
      <DocumentClass class="primitives-page-main" />
      <div
        class="-z-1 absolute left-0 right-0 top-0 h-[95vh]
        bg-[linear-gradient(to_bottom,#fff_var(--primitive-padding-top-gr),transparent)]
        dark:bg-[linear-gradient(to_bottom,#293843_var(--primitive-padding-top-gr),transparent)]"
        style={{
          "--primitive-padding-top-gr": `${PRIMITIVE_PAGE_PADDING_TOP + 300}px`,
        }}
      />
      <main
        class={`${pageWidthClass} mx-auto mb-6 overflow-x-hidden md:overflow-visible`}
        style={{ "padding-top": `${PRIMITIVE_PAGE_PADDING_TOP}px` }}
      >
        <div class="bg-page-main-bg rounded-3xl p-3 sm:p-8">
          <div class="mb-[90px] flex items-center justify-between gap-[30px] text-[#232324] dark:text-white sm:gap-[100px]">
            <Heading name={data.name} formattedName={formattedName()} />
          </div>

          <div class="my-8">
            <InfoBar
              name={data.name}
              version={data.version}
              packageName={packageName()}
              packageSize={data.packageSize}
              primitives={data.primitives}
              stage={data.stage}
            />
          </div>

          <div class="prose">
            <H2 text="Installation" />
            <PackageInstallation packageName={packageName()} />

            <H2 text="Readme" />
            <Suspense fallback={<div style={{ height: "300px" }} />}>
              <div
                ref={el => {
                  // displaying readme is under suspense, so the router doesn't wait for it to be ready
                  // it will be rendered after the page is already visible,
                  // so we fade it in, but only during client-side navigation
                  if (!el.isConnected) {
                    el.style.opacity = "0";
                    el.style.transition = "opacity 0.3s ease-in-out";
                    onMount(() => {
                      requestAnimationFrame(() => (el.style.opacity = ""));
                    });
                  }

                  createPrimitiveNameTooltips(el, () => data.primitives);
                }}
                innerHTML={data.readme}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
};

export default Page;

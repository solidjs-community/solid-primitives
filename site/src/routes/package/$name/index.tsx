import { createMemo, onMount } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import { fetchPackageData } from "~/api.js";
import { PRIMITIVE_PAGE_PADDING_TOP } from "~/components/Header/Header.jsx";
import InfoBar from "~/components/Primitives/InfoBar.jsx";
import { H2 } from "~/components/prose.jsx";
import { pageWidthClass } from "~/constants.js";
import { DocumentClass } from "~/primitives/document-class.jsx";
import { kebabCaseToCapitalized } from "~/utils.js";
import { Heading } from "./-components/heading.js";
import { PackageInstallation } from "./-components/package-installation.js";
import { createPrimitiveNameTooltips } from "./-components/primitive-name-tooltips.js";

export const Route = createFileRoute("/package/$name/")({
  component: PackagePage,
  loader: async ({ params }) => fetchPackageData(params.name),
  head: ({ params }) => ({
    meta: [{ title: `${kebabCaseToCapitalized(params.name)} — Solid Primitives` }],
  }),
});

function PackagePage() {
  const params = Route.useParams();
  const data = Route.useLoaderData();

  const formattedName = createMemo(() => kebabCaseToCapitalized(params().name));
  const packageName = () => `@solid-primitives/${params().name}`;

  return (
    <>
      <DocumentClass class="primitives-page-main" />
      <div
        class="-z-1 absolute left-0 right-0 top-0 h-[95vh] bg-[linear-gradient(to_bottom,#fff_var(--primitive-padding-top-gr),transparent)] dark:bg-[linear-gradient(to_bottom,#293843_var(--primitive-padding-top-gr),transparent)]"
        style={{
          "--primitive-padding-top-gr": `${PRIMITIVE_PAGE_PADDING_TOP + 300}px`,
        }}
      />
      <main
        class={`${pageWidthClass} mx-auto mb-6 overflow-x-hidden md:overflow-visible`}
        style={{ "padding-top": `${PRIMITIVE_PAGE_PADDING_TOP}px` }}
      >
        <div class="bg-page-main-bg rounded-3xl p-3 sm:p-8">
          <div class="mb-[90px] flex items-center justify-between gap-[30px] text-[#232324] sm:gap-[100px] dark:text-white">
            <Heading name={params().name} formattedName={formattedName()} />
          </div>

          <div class="my-8">
            <InfoBar
              name={params().name}
              version={data().version}
              packageName={packageName()}
              packageSize={data().packageSize}
              primitives={data().primitives}
              stage={data().primitive?.stage}
            />
          </div>

          <div class="prose">
            <H2 text="Installation" />
            <PackageInstallation packageName={packageName()} />

            <H2 text="Readme" />
            <div
              ref={el => {
                // Fade the readme in during client-side navigation. `el.isConnected`
                // is false when the element is being created fresh (SPA nav) and
                // true when hydrating SSR'd HTML — we only animate the former so
                // the initial page load doesn't flash.
                if (!el.isConnected) {
                  el.style.opacity = "0";
                  el.style.transition = "opacity 0.3s ease-in-out";
                  onMount(() => {
                    requestAnimationFrame(() => (el.style.opacity = ""));
                  });
                }

                createPrimitiveNameTooltips(el, () => data().primitives);
              }}
              innerHTML={data().readme}
            />
          </div>
        </div>
      </main>
    </>
  );
}

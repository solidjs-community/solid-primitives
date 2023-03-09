import { FiArrowLeft } from "solid-icons/fi";
import { onCleanup } from "solid-js";
import { A, Title } from "solid-start";
import { HttpStatusCode } from "solid-start/server";
import { pageWidthClass } from "~/constants";
import onPreMount from "~/hooks/onPreMount";

export default function NotFound() {
  onPreMount(() => {
    document.documentElement.classList.add("full-page");
    onCleanup(() => {
      document.documentElement.classList.remove("full-page");
    });
  });

  return (
    <main
      class={`${pageWidthClass} w-full p-4 pt-[100px] lg:pt-[150px] min-h-[calc(100vh-250px)] mx-auto`}
    >
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <h1 class="text-xl text-center mb-12">Primitive not Found</h1>
      <div class="flex justify-center overflow-x-clip">
        <div class="flex text-[100px] font-bold">
          <span class="relative" style="left: 3px; top: -34px;">
            4
            <span
              class="absolute top-[58%] left-0 -scale-y-100 mask-image-[linear-gradient(to_bottom,transparent_95px,#000)] opacity-40 dark:opacity-25 blur-[2px] block select-none pointer-events-none"
              aria-hidden="true"
            >
              4
            </span>
            <svg
              class="absolute top-0 left-0 -z-1"
              viewBox="0 0 88.975 79.46"
              // @ts-ignore
              xml:space="preserve"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              style="width: 247px; left: -80px; pointer-events: none;"
            >
              <use
                href="#solid-blocks-header-cluster-e"
                style="transform-origin: center; transform: scale(1.5) translate(-17px, -2px);"
              />
            </svg>
          </span>
          <span class="relative">
            0
            <span
              class="absolute top-[58%] left-0 -scale-y-100 mask-image-[linear-gradient(to_bottom,transparent_100px,#000)] opacity-40 dark:opacity-25 blur-[2px] block select-none pointer-events-none"
              aria-hidden="true"
            >
              0
            </span>
            <svg
              class="absolute top-0 left-0 -z-1"
              viewBox="0 0 88.975 79.46"
              // @ts-ignore
              xml:space="preserve"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              style="width: 247px; left: -80px; pointer-events: none;"
            >
              <use
                href="#solid-blocks-header-cluster-e"
                style="transform-origin: center; transform: scale(1.5) translate(-17px, -2px);"
              />
            </svg>
          </span>
          <span class="relative" style="left: -5px; top: -41px;">
            4
            <span
              class="absolute top-[58%] left-0 -scale-y-100 mask-image-[linear-gradient(to_bottom,transparent_95px,#000)] opacity-40 dark:opacity-25 blur-[2px] block select-none pointer-events-none"
              aria-hidden="true"
            >
              4
            </span>
            <svg
              class="absolute top-0 left-0 -z-1"
              viewBox="0 0 88.975 79.46"
              // @ts-ignore
              xml:space="preserve"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              style="width: 247px; left: -80px; pointer-events: none;"
            >
              <use
                href="#solid-blocks-header-cluster-e"
                style="transform-origin: center; transform: scale(1.5) translate(-17px, -2px);"
              />
            </svg>
          </span>
        </div>
      </div>
      <div class="flex justify-center mt-24">
        <A href="/" class="flex items-center gap-4 py-2 px-4 hover:opacity-70">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-arrow-left"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Main</span>
        </A>
      </div>
    </main>
  );
}

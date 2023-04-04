import { createVisibilityObserver } from "@solid-primitives/intersection-observer";
import { isIOS, isSafari } from "@solid-primitives/platform";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import { Component, createSignal, For, onMount } from "solid-js";
import { Bundlesize, BundlesizeItem } from "~/types";

const SHARED_HEADERS = ["Minified", "Minified + GZipped"] as const;
const PACKAGE_TH_HEADERS = ["Package", ...SHARED_HEADERS] as const;
const PRIMITIVE_TH_HEADERS = ["Primitive", ...SHARED_HEADERS] as const;

const BundleSizeModal: Component<{
  name: string;
  packageSize: Bundlesize | undefined;
  primitives: BundlesizeItem[];
}> = props => {
  const [target, setTarget] = createSignal<Element>();
  let theadEl!: HTMLTableSectionElement;
  let tableEl!: HTMLTableElement;
  let tableContainerEl!: HTMLTableElement;
  const [theadHeight, setTheadHeight] = createSignal(0);

  // TODO: createElementSize messes up modal overflow page layout, so using createResizeObserver instead
  // const theadSize = createElementSize(() => theadEl);
  createResizeObserver(
    () => [theadEl],
    ({ height }) => {
      setTheadHeight(height);
    },
  );

  const isTargetVisible = createVisibilityObserver({ rootMargin: "0px 0px -100%", threshold: 0 })(
    target,
  );

  const fitFont = () => {
    tableEl; // 338 (+ 2 due to calc(100%+2px)) so = 340
    tableContainerEl; // 328

    const tableWidth = tableEl.getBoundingClientRect().width; // requires 4 for math to work?
    const tableContainerWidth = tableContainerEl.getBoundingClientRect().width;
    const tableWidthDiff = tableWidth - tableContainerWidth;

    if (Math.floor(tableWidthDiff) <= 2) return;

    // 340 - 328 = diff is 12
    // this means that when checking primitive cell, if span's width difference from parent td's width is greater than 12, skip it

    const tdEls = [...tableEl.querySelectorAll("[data-primitive-td]")] as HTMLElement[];
    const tdBCR = tdEls[0].getBoundingClientRect();
    const tdPaddingX = 8;
    const tdWidth = tdBCR.width - tdPaddingX;
    const filteredTdEls = tdEls
      .map(el => {
        const span = el.querySelector("[data-primitive-span]") as HTMLElement;
        return {
          span: span,
          spanBCR: span.getBoundingClientRect(),
        };
      })
      .filter(({ spanBCR }) => {
        return tdWidth - spanBCR.width <= tableWidthDiff;
      });

    const largestTDCellWidth = Math.max(...filteredTdEls.map(item => item.spanBCR.width));

    const currentRenderedFontSize = 14;
    filteredTdEls.forEach(({ span, spanBCR }) => {
      // for largest td cell
      // smFont = 14
      // newFont = (smFont * 328) /344.11
      if (spanBCR.width === largestTDCellWidth) {
        // span.style.fontSize = `${(currentRenderedFontSize * tableContainerWidth) / tableWidth}px`;
        const newSpanWidth = spanBCR.width - tableWidthDiff;
        span.style.fontSize = `${currentRenderedFontSize * (newSpanWidth / spanBCR.width)}px`;
        return;
      }
      // for lesser (but still within 12px)
      // smFont = 14
      // newFont = smFont * (184.03 span / 190.27 td)
      span.style.fontSize = `${currentRenderedFontSize * (spanBCR.width / tdWidth)}px`;
    });
  };

  onMount(() => {
    fitFont();
  });

  return (
    <div class="bg-page-main-bg max-w-[800px] rounded-md p-2 pt-3 sm:p-4">
      <h2 class="border-b border-slate-300 pb-1 text-lg font-semibold dark:border-slate-600">
        Bundle Size
      </h2>
      <div>
        <p>
          Package and Primitive sizes calculated by{" "}
          <a href="https://esbuild.github.io/" target="_blank" rel="noopener">
            esbuild
          </a>
          .
        </p>
        <h3 class="my-4">Total Size of Package</h3>
        <div class="relative overflow-clip rounded-xl bg-[#e5ecf3] dark:bg-[#2b455a]">
          <div class="z-1 pointer-events-none absolute bottom-0 left-0 right-0 top-0 rounded-xl border-2 border-[#e5ecf3] dark:border-[#2b455a]"></div>
          <table class="my-4 w-full" style="border-collapse: separate; border-spacing: 2px 2px;">
            <thead>
              <tr class="bg-page-main-bg font-semibold text-[#49494B] dark:text-[#b7c1d0]">
                <For each={PACKAGE_TH_HEADERS}>
                  {item => (
                    <th class="xxs:text-sm p-1 text-center text-xs md:px-3 md:text-base">{item}</th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <tr class="even:bg-page-main-bg odd:bg-[#f6fbff] dark:odd:bg-[#2b3f4a]">
                <td class="p-1 text-sm md:px-3 md:text-base">
                  <span class="flex flex-wrap">
                    <span class="whitespace-nowrap">@solid-primitives/</span>
                    <span>{props.name}</span>
                  </span>
                </td>
                <td class="whitespace-nowrap p-1 text-center text-sm md:px-3 md:text-base">
                  {props.packageSize?.min ?? "N/A"}
                </td>
                <td class="whitespace-nowrap p-1 text-center text-sm md:px-3 md:text-base">
                  {props.packageSize?.gzip ?? "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="my-4">
          Size of Primitives <span class="opacity-60">( tree-shakeable )</span>
        </h3>
        <div
          class="relative overflow-clip rounded-xl bg-[#e5ecf3] dark:bg-[#2b455a]"
          ref={tableContainerEl}
        >
          <div class="z-1 pointer-events-none absolute bottom-0 left-0 right-0 top-0 rounded-xl border-2 border-[#e5ecf3] dark:border-[#2b455a]" />
          <table
            // fake <th> element for th shadow causes table to lose width equivalent to border-spacing, which is 2px, so make up for up for it by setting width to 100% + 2px.
            class="my-4 w-[calc(100%+2px)]"
            style="border-collapse: separate; border-spacing: 2px 2px;"
            ref={el => setTarget((tableEl = el))}
          >
            <thead
              class="sticky"
              classList={{ "top-[-2px]": isSafari || isIOS, "top-0": !(isSafari || isIOS) }}
              ref={theadEl}
            >
              <tr class="bg-page-main-bg font-semibold text-[#49494B] dark:text-[#b7c1d0]">
                <For each={PRIMITIVE_TH_HEADERS}>
                  {item => (
                    <th class="xxs:text-sm p-1 text-center text-xs md:px-3 md:text-base">{item}</th>
                  )}
                </For>
                <th
                  aria-label="hidden"
                  class="box-shadow-[var(--table-header-box-shadow)] pointer-events-none absolute top-0 left-0 right-0 bottom-0 transition-opacity will-change-transform"
                  style={{ height: `${theadHeight() - 2}px`, opacity: isTargetVisible() ? 1 : 0 }}
                />
              </tr>
            </thead>
            <tbody>
              <For each={props.primitives}>
                {item => (
                  <tr class="even:bg-page-main-bg odd:bg-[#f6fbff] dark:odd:bg-[#2b3f4a]">
                    <td class="p-1 text-sm md:px-3 md:text-base" data-primitive-td>
                      <span class="inline-block" data-primitive-span>
                        {item.name}
                      </span>
                    </td>
                    <td class="whitespace-nowrap p-1 text-center text-sm md:px-3 md:text-base">
                      {item.min}
                    </td>
                    <td class="whitespace-nowrap p-1 text-center text-sm md:px-3 md:text-base">
                      {item.gzip}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
      <p>
        <a
          class=" anchor-tag text-sm hover:opacity-100 dark:opacity-60"
          href="https://jvns.ca/blog/2013/10/23/day-15-how-gzip-works/"
          target="_blank"
          rel="noopener"
        >
          GZip headers and metadata not included (~20 bytes)
        </a>
      </p>
    </div>
  );
};

export default BundleSizeModal;

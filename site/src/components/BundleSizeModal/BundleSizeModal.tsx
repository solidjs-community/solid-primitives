import { createIntersectionObserver } from "@solid-primitives/intersection-observer";
import { isIOS, isSafari } from "@solid-primitives/platform";
import { createResizeObserver, createElementSize } from "@solid-primitives/resize-observer";
import { Component, createSignal, For, onMount } from "solid-js";

export type TBundleSizeItem = {
  name: string;
  minified: string;
  gzipped: string;
};
const BundleSizeModal: Component<{
  packageList: TBundleSizeItem[];
  primitiveList: TBundleSizeItem[];
}> = ({ packageList, primitiveList }) => {
  const sharedHeaders = ["Minified", "Minified + GZipped"];
  const packageThHeaders = ["Package", ...sharedHeaders];
  const primitiveThHeaders = ["Primitive", ...sharedHeaders];
  const [showShadow, setShowShadow] = createSignal(false);
  const [target, setTarget] = createSignal<Element[]>([]);
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
    }
  );
  createIntersectionObserver(
    target,
    entries => {
      entries.forEach(entry => {
        const { isIntersecting } = entry;
        setShowShadow(isIntersecting);
      });
    },
    { rootMargin: "0px 0px -100%", threshold: 0 }
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
          spanBCR: span.getBoundingClientRect()
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
    <div class="bg-page-main-bg rounded-md p-2 pt-3 max-w-[800px] sm:p-4">
      <h2 class="font-semibold text-lg pb-1 border-b border-slate-300 dark:border-slate-600">
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
        <div class="rounded-xl overflow-clip relative bg-[#e5ecf3] dark:bg-[#2b455a]">
          <div class="absolute top-0 left-0 right-0 bottom-0 border-[#e5ecf3] border-2 rounded-xl pointer-events-none dark:border-[#2b455a] z-1"></div>
          <table class="w-full my-4" style="border-collapse: separate; border-spacing: 2px 2px;">
            <thead>
              <tr class="bg-page-main-bg font-semibold text-[#49494B] dark:text-[#dee2e5]">
                <For each={packageThHeaders}>
                  {item => (
                    <th class="p-1 text-center text-xs xxs:text-sm md:px-3 md:text-base">{item}</th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={packageList}>
                {({ name, minified, gzipped }) => {
                  return (
                    <tr class="odd:bg-[#f6fbff] even:bg-page-main-bg dark:odd:bg-[#2b3f4a]">
                      <td class="p-1 text-sm md:px-3 md:text-base">
                        <span class="flex flex-wrap">
                          <span class="whitespace-nowrap">@solid-primitives/</span>
                          <span>{name}</span>
                        </span>
                      </td>
                      <td class="p-1 text-sm md:px-3 md:text-base text-center whitespace-nowrap">
                        {minified}
                      </td>
                      <td class="p-1 text-sm md:px-3 md:text-base text-center whitespace-nowrap">
                        {gzipped}
                      </td>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
        <h3 class="my-4">
          Size of Primitives <span class="opacity-60">( tree-shakeable )</span>
        </h3>
        <div
          class="rounded-xl overflow-clip relative bg-[#e5ecf3] dark:bg-[#2b455a]"
          ref={tableContainerEl}
        >
          <div class="absolute top-0 left-0 right-0 bottom-0 border-[#e5ecf3] border-2 rounded-xl pointer-events-none dark:border-[#2b455a] z-1" />
          <table
            // fake <th> element for th shadow causes table to lose width equivalent to border-spacing, which is 2px, so make up for up for it by setting width to 100% + 2px.
            class="w-[calc(100%+2px)] my-4"
            style="border-collapse: separate; border-spacing: 2px 2px;"
            ref={el => {
              setTarget([el]);
              tableEl = el;
            }}
          >
            <thead
              class="sticky"
              classList={{ "top-[-2px]": isSafari || isIOS, "top-0": !(isSafari || isIOS) }}
              ref={theadEl}
            >
              <tr class="bg-page-main-bg font-semibold text-[#49494B] dark:text-[#dee2e5]">
                <For each={primitiveThHeaders}>
                  {item => (
                    <th class="p-1 md:px-3 text-center text-xs xxs:text-sm md:text-base">{item}</th>
                  )}
                </For>
                <th
                  aria-label="hidden"
                  class="absolute top-0 left-0 right-0 bottom-0 pointer-events-none box-shadow-[var(--table-header-box-shadow)] will-change-transform transition-opacity"
                  classList={{ "opacity-0": !showShadow(), "opacity-100": showShadow() }}
                  style={{ height: `${theadHeight() - 2}px` }}
                />
              </tr>
            </thead>
            <tbody>
              <For each={primitiveList}>
                {({ name, minified, gzipped }) => {
                  return (
                    <tr class="odd:bg-[#f6fbff] even:bg-page-main-bg dark:odd:bg-[#2b3f4a]">
                      <td class="p-1 text-sm md:px-3 md:text-base" data-primitive-td>
                        <span class="inline-block" data-primitive-span>
                          {name}
                        </span>
                      </td>
                      <td class="p-1 text-sm md:px-3 md:text-base text-center whitespace-nowrap">
                        {minified}
                      </td>
                      <td class="p-1 text-sm md:px-3 md:text-base text-center whitespace-nowrap">
                        {gzipped}
                      </td>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BundleSizeModal;

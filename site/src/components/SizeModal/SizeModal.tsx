import { Component, For } from "solid-js";

export type TBundleSizeItem = {
  name: string;
  minified: string;
  gzipped: string;
};
const SizeModal: Component<{
  packageList: TBundleSizeItem[];
  primitiveList: TBundleSizeItem[];
}> = ({ packageList, primitiveList }) => {
  return (
    <div class="bg-page-main-bg rounded-md p-2 pt-3 max-w-[800px] sm:p-4">
      <h2 class="font-semibold text-lg pb-1 border-b border-slate-300 dark:border-slate-600">
        Bundle Size
      </h2>
      <div>
        <p>
          Package and Primitive sizes calculated by{" "}
          <a href="https://esbuild.github.io/" target="_blank">
            esbuild
          </a>
          .
        </p>
        <h3 class="my-4">Total Size of Package</h3>
        <div class="rounded-xl overflow-clip relative bg-[#e5ecf3] dark:bg-[#2b455a]">
          <div class="absolute top-0 left-0 right-0 bottom-0 border-[#e5ecf3] border-2 rounded-xl pointer-events-none dark:border-[#2b455a]"></div>
          <table class="w-full my-4" style="border-collapse: separate; border-spacing: 2px 2px;">
            <thead>
              <tr class="bg-page-main-bg font-semibold text-[#49494B] dark:text-[#dee2e5]">
                <th class="p-2 pb-1 text-center">Package</th>
                <th class="p-2 pb-1">Minified</th>
                <th class="p-2 pb-1">Minified + GZipped</th>
              </tr>
            </thead>
            <tbody>
              <For each={packageList}>
                {({ name, minified, gzipped }) => {
                  return (
                    <tr class="odd:bg-[#f6fbff] even:bg-page-main-bg dark:odd:bg-[#2b3f4a]">
                      <td class="p-1 px-2">{name}</td>
                      <td class="p-1 px-2">{minified}</td>
                      <td class="p-1 px-2">{gzipped}</td>
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
        <div class="rounded-xl overflow-clip relative bg-[#e5ecf3] dark:bg-[#2b455a]">
          <div class="absolute top-0 left-0 right-0 bottom-0 border-[#e5ecf3] border-2 rounded-xl pointer-events-none dark:border-[#2b455a]" />
          <table class="w-full my-4" style="border-collapse: separate; border-spacing: 2px 2px;">
            <thead>
              <tr class="bg-page-main-bg font-semibold text-[#49494B] dark:text-[#dee2e5]">
                <th class="p-2 pb-1 text-center">Primitive</th>
                <th class="p-2 pb-1">Minified</th>
                <th class="p-2 pb-1">Minified + GZipped</th>
              </tr>
            </thead>
            <tbody>
              <For each={primitiveList}>
                {({ name, minified, gzipped }) => {
                  console.log({ name, minified, gzipped });
                  return (
                    <tr class="odd:bg-[#f6fbff] even:bg-page-main-bg dark:odd:bg-[#2b3f4a]">
                      <td class="p-1 px-2">{name}</td>
                      <td class="p-1 px-2">{minified}</td>
                      <td class="p-1 px-2">{gzipped}</td>
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

export default SizeModal;

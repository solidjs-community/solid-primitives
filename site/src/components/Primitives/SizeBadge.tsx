import { Component, ComponentProps, createSignal, ParentComponent } from "solid-js";
import SlideModal from "../Modal/SlideModal";
import BundleSizeModal from "../BundleSizeModal/BundleSizeModal";
import { FormattedBytes } from "~/types";

const getBundleJSHref = ({
  packageName,
  exportName,
  peerDependencies,
}: {
  packageName: string;
  exportName?: string;
  peerDependencies: string[];
}) => {
  const query = encodeURIComponent(`@solid-primitives/${packageName}`);
  const config = encodeURIComponent(
    `{"esbuild":${JSON.stringify({ external: peerDependencies })}}`,
  );
  return `https://bundlejs.com/?q=${query}${
    exportName ? `&treeshake=${encodeURIComponent(`[{${exportName}}]`)}` : ""
  }&config=${config}`;
};

export const SizeBadge: Component<
  { value: FormattedBytes } & Parameters<typeof getBundleJSHref>[0]
> = props => {
  return (
    <a
      class="flex h-[28px] min-w-[90px] items-baseline justify-center rounded-md border-2 border-[#cae0ff] bg-[#cae0ff40] font-sans transition-colors hover:border-[#80a7de] hover:bg-[#cae0ff66] dark:border-[#5577a7] dark:bg-[#6eaaff14] dark:hover:border-[#8ba8d3] dark:hover:bg-[#6eaaff33]"
      href={getBundleJSHref(props)}
      rel="noopener"
      target="_blank"
    >
      {props.value[0]}
      <span class="text-[14px] font-semibold text-[#7689a4] dark:text-[#8b9eba]">
        &nbsp{props.value[1]}
      </span>
    </a>
  );
};
export const SizeBadgeWrapper: ParentComponent<{ primitiveName: string }> = props => {
  let el: HTMLElement | null;

  return (
    <div
      class="py-[6px]"
      onMouseEnter={() => {
        el = document.querySelector(
          `[data-line-primitive-id="${props.primitiveName}"`,
        ) as HTMLElement;
        el.style.opacity = "1";
      }}
      onMouseLeave={() => {
        el!.style.opacity = "";
        el = null;
      }}
    >
      {props.children}
    </div>
  );
};

export const SizeBadgePill: ParentComponent<ComponentProps<typeof BundleSizeModal>> = props => {
  const [open, setOpen] = createSignal(false);
  let menuButton!: HTMLButtonElement;

  return (
    <>
      <button
        class="transition-filter relative flex font-sans hover:contrast-[1.2]"
        ref={menuButton}
      >
        <div class="flex h-[38px] items-center rounded-l-lg border-[3px] border-[#cae0ff] bg-[#cae0ff40] px-4 dark:border-[#405b6e] dark:bg-[#2a4355]">
          <span>Size</span>
        </div>
        <div class="background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#cae0ff,#c0c8ff)_border-box] dark:background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#405b6e,#46659a)_border-box] flex h-full min-w-[90px] items-center justify-center rounded-r-lg border-[3px] border-l-0 border-transparent font-semibold">
          {props.packageSize ? props.packageSize.gzip.join(" ") : "N/A"}
        </div>
      </button>
      <SlideModal menuButton={menuButton} open={open} setOpen={setOpen}>
        <BundleSizeModal {...props} />
      </SlideModal>
    </>
  );
};

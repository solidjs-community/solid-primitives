import { FiChevronRight } from "solid-icons/fi";
import { createSignal, onMount, ParentComponent } from "solid-js";
import SlideModal from "../Modal/SlideModal";
import BundleSizeModal, { TBundleSizeItem } from "../BundleSizeModal/BundleSizeModal";
import Stage from "../Stage/Stage";

const createFetchSize = (value: string) => {
  const [size, setSize] = createSignal("");
  onMount(() => {
    const fetchValue = async () => {
      try {
        const response = await fetch(value);
        const json = (await response.json()) as { value: string };
        setSize(json.value);
      } catch (err) {}
    };
    fetchValue();
  });

  return size;
};

type SizeProps = {
  value: string | { gzipped?: string; minified?: string };
  unit?: string;
  href: string;
};

const SizeBadge: ParentComponent<SizeProps> = ({ value, href, unit }) => {
  // const size = createFetchSize(value);
  return (
    <a
      class="h-[28px] min-w-[90px] uppercase flex justify-center items-baseline font-sans rounded-md border-[#cae0ff] bg-[#cae0ff40] border-2 hover:border-[#80a7de] hover:bg-[#cae0ff66] transition-colors dark:bg-[#6eaaff14] dark:border-[#5577a7] dark:hover:border-[#8ba8d3] dark:hover:bg-[#6eaaff33]"
      href={href}
      target="_blank"
    >
      {typeof value === "string" ? value : value.gzipped || "0 B"}
      <span class="text-[14px] font-semibold text-[#7689a4] dark:text-[#8b9eba]">
        &nbsp{unit || ""}
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
        el = document.querySelector(`[data-line-primitive="${props.primitiveName}"`) as HTMLElement;
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

export const SizeBadgePill: ParentComponent<
  SizeProps & {
    packageList: TBundleSizeItem[];
    primitiveList: TBundleSizeItem[];
  }
> = ({ value, href, packageList, primitiveList }) => {
  const [open, setOpen] = createSignal(false);
  let menuButton!: HTMLButtonElement;

  return (
    <>
      <button
        class="relative flex font-sans hover:contrast-[1.2] transition-filter"
        ref={menuButton}
      >
        <div class="flex items-center rounded-l-lg h-[38px] border-[#cae0ff] px-4 border-[3px] bg-[#cae0ff40] dark:border-[#405b6e] dark:bg-[#2a4355]">
          <span>Size</span>
        </div>
        <div class="h-full flex justify-center items-center min-w-[90px] rounded-r-lg border-l-0 border-transparent border-[3px] font-semibold background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#cae0ff,#c0c8ff)_border-box] dark:background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#405b6e,#46659a)_border-box]">
          {packageList[0].gzipped}
        </div>
      </button>
      <SlideModal menuButton={menuButton} open={open} setOpen={setOpen}>
        <BundleSizeModal packageList={packageList} primitiveList={primitiveList} />
      </SlideModal>
    </>
  );
};

export default SizeBadge;

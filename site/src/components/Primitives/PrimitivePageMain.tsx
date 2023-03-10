import { FaBrandsGithub } from "solid-icons/fa";
import { ParentComponent } from "solid-js";
import { Title } from "solid-start";
import { pageWidthClass } from "~/constants";
import createTooltipOnCodePrimitives from "~/hooks/createTooltipOnCodePrimitives";
import onPreMount from "~/hooks/onPreMount";
import { TBundleSizeItem } from "../BundleSizeModal/BundleSizeModal";
import Heading from "./Heading";
import InfoBar from "./InfoBar";

const GUTHUB_REPO = "https://github.com/solidjs-community/solid-primitives";

export const PRIMITIVE_PAGE_PADDING_TOP = 140;

const PrimitivePageMain: ParentComponent<{
  packageName: string;
  name: string;
  stage: number;
  packageList: TBundleSizeItem[];
  primitiveList: TBundleSizeItem[];
}> = props => {
  const githubRepoPrimitive = `${GUTHUB_REPO}/tree/main/packages/${props.name}`;

  onPreMount(() => {
    document.documentElement.classList.add("primitives-page-main");
  });

  createTooltipOnCodePrimitives();

  return (
    <>
      <Title>{props.name}</Title>
      <div
        class="-z-1 absolute top-0 left-0 right-0 h-[95vh] bg-[linear-gradient(to_bottom,#fff_var(--primitive-padding-top-gr),transparent)] dark:bg-[linear-gradient(to_bottom,#293843_var(--primitive-padding-top-gr),transparent)]"
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
            {/* <Heading>
              Has This Type Pattern Tried To Sneak In Some Generic Or Parameterized Type Pattern
              Matching Stuff Anywhere Visitor .java
            </Heading> */}

            <Heading>{props.name.replace("-", " ")}</Heading>
            <div class="relative">
              <svg
                class="absolute"
                viewBox="0 0 88.975 79.46"
                // @ts-ignore
                xml:space="preserve"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns="http://www.w3.org/2000/svg"
                style="top: 13px; left: -30px; width: 247px; pointer-events: none;"
              >
                <use href="#solid-blocks-header-cluster-e" transform="translate(-44 -38)" />
                <use href="#solid-blocks-header-cluster-e" transform="translate(-44 -38)" />
                <use href="#solid-blocks-header-cluster-e" transform="translate(-29 -29)" />
              </svg>
              <a
                class="relative inline-block scale-90 transition-opacity hover:opacity-70 sm:scale-100"
                href={githubRepoPrimitive}
                target="_blank"
                rel="noopener"
              >
                <FaBrandsGithub size={28} />
                <div class="mask-image-[linear-gradient(to_bottom,transparent_12px,#000)] absolute top-[32px] left-0 -scale-y-100 opacity-20 blur-[2px]">
                  <FaBrandsGithub size={28} />
                </div>
              </a>
            </div>
          </div>

          <div class="my-8">
            <InfoBar
              packageName={props.packageName}
              name={props.name}
              stage={props.stage}
              packageList={props.packageList}
              primitiveList={props.primitiveList}
            />
          </div>

          <div class="prose">{props.children}</div>
        </div>
      </main>
    </>
  );
};

const addTooltip = () => {};

export default PrimitivePageMain;

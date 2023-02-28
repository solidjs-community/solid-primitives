import { FaBrandsGithub } from "solid-icons/fa";
import { onCleanup, onMount, ParentComponent } from "solid-js";
import { Title } from "solid-start";
import Heading from "./Heading";
import InfoBar from "./InfoBar";
import ON_CLIENT_DEV_MODE from "~/hooks/ON_CLIENT_DEV_MODE";
import { isServer } from "solid-js/web";
import { setHeaderState } from "../Header/Header";
import { pageWidthClass } from "~/constants";
import { TBundleSizeItem } from "../SizeModal/SizeModal";

const githubRepo = "https://github.com/solidjs-community/solid-primitives";

const onStyleMount = ({ mount, cleanup }: { mount: () => void; cleanup: () => void }) => {
  if (isServer) return;
  mount();
  onCleanup(() => {
    cleanup();
  });
};

export const primitivePagePaddingTop = 140;

const PrimitivePageMain: ParentComponent<{
  packageName: string;
  name: string;
  stage: number;
  packageList: TBundleSizeItem[];
  primitiveList: TBundleSizeItem[];
}> = props => {
  const githubRepoPrimitve = `${githubRepo}/tree/main/packages/${props.name}`;

  // until issue is resolved https://github.com/solidjs/solid-start/issues/579
  // ON_CLIENT_DEV_MODE(() => {
  // document.documentElement.style.background = "#f2f8fa";
  // document.documentElement.style.backgroundImage = "linear-gradient(94deg, #f2f8fa, #f1f3fa)";
  // });
  onStyleMount({
    mount: () => {
      document.documentElement.classList.add("primitives-page-main");
      setHeaderState("showGradientBorder", false);
    },
    cleanup: () => {
      document.documentElement.classList.remove("primitives-page-main");
    }
  });

  return (
    <>
      <Title>{props.name}</Title>
      <div
        class="absolute top-0 left-0 right-0 h-[95vh] bg-[linear-gradient(to_bottom,#fff_var(--primitive-padding-top-gr),transparent)] dark:bg-[linear-gradient(to_bottom,#293843_var(--primitive-padding-top-gr),transparent)] -z-1"
        style={{
          "--primitive-padding-top-gr": `${primitivePagePaddingTop + 300}px`
        }}
      />
      <main
        class={`${pageWidthClass} mb-6 mx-auto overflow-x-hidden md:overflow-visible`}
        style={{ "padding-top": `${primitivePagePaddingTop}px` }}
      >
        <div class="p-3 sm:p-8 rounded-3xl bg-page-main-bg">
          <div class="flex justify-between gap-[30px] sm:gap-[100px] items-center text-[#232324] dark:text-white mb-[90px]">
            {/* <Heading>
              Has This Type Pattern Tried To Sneak In Some Generic Or Parameterized Type Pattern
              Matching Stuff Anywhere Visitor .java
            </Heading> */}

            <Heading>{props.name.replace("-", " ")}</Heading>
            <div class="relative">
              <svg
                class="absolute"
                viewBox="0 0 88.975 79.46"
                xml:space="preserve"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns="http://www.w3.org/2000/svg"
                style="top: 13px; left: -30px; width: 247px; pointer-events: none;"
              >
                <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-44 -38)" />
                <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-44 -38)" />
                <use xlink:href="#solid-blocks-header-cluster-e" transform="translate(-29 -29)" />
              </svg>
              <a
                class="relative inline-block scale-90 sm:scale-100 hover:opacity-70 transition-opacity"
                href={githubRepoPrimitve}
                target="_blank"
              >
                <FaBrandsGithub size={28} />
                <div class="absolute top-[32px] left-0 -scale-y-100 mask-image-[linear-gradient(to_bottom,transparent_12px,#000)] opacity-20 blur-[2px]">
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

export default PrimitivePageMain;

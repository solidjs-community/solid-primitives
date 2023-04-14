import { createResizeObserver } from "@solid-primitives/resize-observer";
import { createMutationObserver } from "@solid-primitives/mutation-observer";
import { Accessor, Component, createRoot, createSignal, JSX, onMount } from "solid-js";
import { useTippy } from "solid-tippy";
import { Content } from "tippy.js";
import { BASE } from "~/constants";
import { BundlesizeItem } from "~/types";

export type PrimitiveType = "create" | "use" | "make" | "get" | "component" | "utility";

const getTypeOfPrimitive = (input: string): PrimitiveType => {
  if (input.match(/^(?:create)[A-Z]/)) return "create";
  if (input.match(/^(?:use)[A-Z]/)) return "use";
  if (input.match(/^(?:make)[A-Z]/)) return "make";
  if (input.match(/^(?:get)[A-Z]/)) return "get";
  if (input.match(/^[A-Z][a-z]?/)) return "component";
  return "utility";
};

const LintToExplanation: Component<{ isReactive?: true }> = props => (
  <a class="anchor-tag-underline" href={`${BASE}#make-non-reactive-vs-create-reactive`}>
    ( {props.isReactive ? "is" : "not"} <strong>reactive</strong> )
  </a>
);

const TypeDescriptionContentMap: Record<PrimitiveType, Accessor<JSX.Element>> = {
  get: () => (
    <>
      get <LintToExplanation />
    </>
  ),
  make: () => (
    <>
      make <LintToExplanation />
    </>
  ),
  create: () => (
    <>
      create <LintToExplanation isReactive />
    </>
  ),
  use: () => (
    <>
      use <LintToExplanation isReactive />
    </>
  ),
  component: () => "JSX Component",
  utility: () => "Utility Function",
};

function createTooltipContent(el: HTMLElement, data: BundlesizeItem, type: PrimitiveType): Content {
  const [target, setTarget] = createSignal<HTMLDivElement>();
  const [elSize, setElSize] = createSignal({ height: 0, width: 0 });
  const [placement, setPlacement] = createSignal("top");

  createResizeObserver(
    () => (target() ? [target()!] : []),
    () => {
      const { height, width } = target()!.getBoundingClientRect();
      if (!(height > 0 && width > 0)) return;

      setElSize({ height, width });
    },
  );

  createMutationObserver(
    () => {
      const el = target()?.parentElement?.parentElement;
      return el ? [el] : [];
    },
    { attributes: true, attributeFilter: ["data-placement"], attributeOldValue: true },
    records => {
      records.forEach(record => {
        if (!(record.target instanceof Element) || !record.attributeName) return;
        const dataPlacement = record.target.getAttribute(record.attributeName);
        dataPlacement && setPlacement(dataPlacement);
      });
    },
  );

  return (
    <div
      class="relative rounded-[9px] bg-[#2d466d] p-3 text-white dark:bg-[#a6c6df] dark:text-black"
      ref={setTarget}
    >
      <div class="mb-2">
        <h2 class="font-semibold opacity-80">Type</h2>
        <div class="text-[14px]">{TypeDescriptionContentMap[type]()}</div>
      </div>
      <div>
        <h2 class="font-semibold opacity-80">Size</h2>
        <div class="w-min">
          <div class="flex justify-between gap-2 whitespace-nowrap text-[14px]">
            Minified <span>{data.min}</span>
          </div>
          <div class="flex justify-between gap-2 whitespace-nowrap text-[14px]">
            GZipped <span>{data.gzip}</span>
          </div>
        </div>
      </div>

      <TooltipSVG
        width={elSize().width}
        height={elSize().height}
        placement={placement() as "top"}
      />
    </div>
  ) as Content;
}

const TooltipSVG: Component<{
  width: number;
  height: number;
  placement: "top" | "bottom";
}> = props => {
  const widthOfArrow = 16;
  const heightOfArrow = 8.721;
  const halfedWidthSection = () => props.width / 2 - widthOfArrow / 2 + 1.5;

  return (
    <div
      class="pointer-events-none absolute inset-0"
      style={{
        transform: props.placement === "bottom" ? "rotate(180deg)" : "none",
      }}
    >
      <svg
        width={props.width}
        height={props.height + heightOfArrow}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="clipPath3434">
            <path
              // d="m-5.6602-6.5625v65.502h22.66v-18.697h16v18.697h22.164v-65.502z"
              // d="m -4.1602,-6.638771 v 65.502 h 22.66 v -18.697 h 16 v 18.697 h 22.164 v -65.502 z"
              d={`M -3,-0 v ${
                props.height + 3
              } h ${halfedWidthSection()} v -20 h ${widthOfArrow} v 20 h ${halfedWidthSection()} v -${
                props.height + 3
              } z`}
              //
              stop-color="#000000"
            />
          </clipPath>
          <clipPath id="clipPath3570">
            <rect
              transform="rotate(-45)"
              x="16.113"
              y="50.074"
              width="17.774"
              height="18.395"
              stop-color="#000000"
            />
          </clipPath>
          <linearGradient
            id="linearGradient3603"
            x1={props.placement === "top" ? "0" : props.width - 3}
            x2={props.placement !== "top" ? "0" : props.width - 3}
            y1="26.576"
            y2="26.576"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              class="stop-color-[#84bce8] dark:stop-color-[#4298db]"
              stop-color="#84bce8"
              offset="0"
            />
            <stop
              class="stop-color-[#2371e8] dark:stop-color-[#3772cc]"
              stop-color="#2371e8"
              offset="1"
            />
          </linearGradient>
        </defs>
        <rect
          transform="translate(1.5 -.076271)"
          y="1.5763"
          width={props.width - 3}
          height={props.height}
          ry="8"
          clip-path="url(#clipPath3434)"
          fill="none"
          stop-color="#000000"
          stroke="url(#linearGradient3603)"
          stroke-linecap="round"
          stroke-width="3"
        />
        <g transform={`translate(${(props.width - 53) / 2} ${props.height - 50})`}>
          <rect
            class="fill-[#2d466d] dark:fill-[#a6c6df]"
            transform="rotate(45 .84207 1.7725)"
            x="9.3694"
            y="-25.986"
            width="50"
            height="50"
            ry="4"
            clip-path="url(#clipPath3570)"
            stop-color="#000000"
            stroke="url(#linearGradient3603)"
            stroke-linecap="round"
            stroke-width="3"
          />
        </g>
      </svg>
    </div>
  );
};

export function createPrimitiveNameTooltips(props: {
  target: HTMLElement;
  primitives: BundlesizeItem[];
}): void {
  onMount(() => {
    const codeAttributeName = "data-code-primitive-name";
    const els = props.target.querySelectorAll<HTMLElement>(`[${codeAttributeName}]`);

    for (const el of els) {
      const primitiveName = el.getAttribute(codeAttributeName);
      if (!primitiveName) continue;

      const data = props.primitives.find(primitive => primitive.name === primitiveName);
      if (!data) continue;

      const type = getTypeOfPrimitive(data.name);

      let dispose: () => void;

      useTippy(() => el, {
        props: {
          onMount(instance) {
            createRoot(_dispose => {
              dispose = _dispose;
              instance.setContent(createTooltipContent(el, data, type));
            });
          },
          onHidden: () => dispose(),
          interactive: true,
          appendTo: () => document.body,
        },
        hidden: true,
      });
    }
  });
}

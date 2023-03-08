import { createResizeObserver } from "@solid-primitives/resize-observer";
import { batch, Component, createSignal, Match, onMount, Switch } from "solid-js";
import { useTippy } from "solid-tippy";
import { Content } from "tippy.js";
import { BASE } from "~/constants";
import { TPrimitiveJson } from "~/ts/primitivesJson";
import _primitivesJSON from "~/_generated/primitives.json";
const primitivesJSON: TPrimitiveJson = _primitivesJSON;

const TooltipContent = (el: HTMLElement) => {
  if (!el) return;
  const packageName = el.getAttribute("data-code-package-name")!;
  const primitiveName = el.getAttribute("data-code-primitive-name")!;
  const packageData = primitivesJSON.find(item => item.name === packageName)!;
  const primitiveData = packageData.primitives.find(item => item.name === primitiveName)!;
  const type = getTypeOfPrimitive(primitiveName);
  const [target, setTarget] = createSignal<HTMLDivElement[]>([]);
  const [elSize, setElSize] = createSignal({ height: 0, width: 0 });
  const [placement, setPlacement] = createSignal("top");

  createResizeObserver(target, () => {
    const el = target()[0];
    if (!el) return;
    const dataPlacement = el.parentElement?.parentElement!.getAttribute("data-placement")!;
    const { height, width } = el.getBoundingClientRect();
    if (!(height > 0 && width > 0)) return;

    batch(() => {
      setPlacement(dataPlacement);
      setElSize({ height, width });
    });
  });

  return (
    <div
      class="relative bg-[#2d466d] text-white dark:bg-[#a6c6df] dark:text-black p-3 rounded-[9px]"
      ref={el => setTarget([el])}
    >
      <h2 class="font-semibold opacity-80">Type</h2>
      <div class="text-[14px]">
        <Switch>
          <Match when={type === "make"}>
            <span>
              make{" "}
              <a class="anchor-tag-underline" href={`${BASE}#make-non-reactive-vs-create-reactive`}>
                ( not <strong>reactive</strong> )
              </a>
            </span>
          </Match>
          <Match when={type === "create"}>
            <span>
              create{" "}
              <a class="anchor-tag-underline" href={`${BASE}#make-non-reactive-vs-create-reactive`}>
                ( is <strong>reactive</strong> )
              </a>
            </span>
          </Match>
          <Match when={type === "component"}>
            <span>JSX Component</span>
          </Match>
          <Match when={type === "utility"}>
            <span>Utility Function</span>
          </Match>
        </Switch>
      </div>
      <h2 class="font-semibold opacity-80">Size</h2>
      <div class="w-min">
        <div class="flex justify-between gap-2 text-[14px] whitespace-nowrap">
          Minified <span>{primitiveData.size.minified}</span>
        </div>
        <div class="flex justify-between gap-2 text-[14px] whitespace-nowrap">
          GZipped <span>{primitiveData.size.gzipped}</span>
        </div>
      </div>

      <TooltipSVG
        width={elSize().width}
        height={elSize().height}
        placement={placement() as "top"}
      />
    </div>
  );
};

const TooltipSVG: Component<{
  width: number;
  height: number;
  placement: "top" | "bottom";
}> = props => {
  const totalWidth = () => props.width - 3;
  const totalHeight = () => props.height - 3;
  const widthOfArrow = 16;
  const heightOfArrow = 8.721;
  const widthFoo = () => props.width / 2 - widthOfArrow / 2 + 1.5;
  return (
    <div
      class="absolute inset-0 pointer-events-none"
      style={{
        transform: props.placement === "bottom" ? "rotate(180deg)" : undefined,
      }}
    >
      <svg
        // width={totalWidth()}
        // height={totalHeight()}
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
              } h ${widthFoo()} v -20 h ${widthOfArrow} v 20 h ${widthFoo()} v -${
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

const getTypeOfPrimitive = (input: string) => {
  if (input.match(/^make[A-Z]/)) return "make";
  if (input.match(/^create[A-Z]/)) return "create";
  if (input.match(/^[A-Z]/)) return "component";
  return "utility";
};

const createTooltipOnCodePrimitives = () => {
  return onMount(() => {
    const els = document
      .querySelector("main .prose")!
      .querySelectorAll("[data-code-primitive-name]") as NodeListOf<HTMLElement>;
    els.forEach(el => {
      useTippy(() => el, {
        props: {
          onMount: instance => {
            instance.setContent(TooltipContent(el) as Content);
          },
          interactive: true,
          appendTo: () => document.body,
        },
        hidden: true,
      });
    });
  });
};

export default createTooltipOnCodePrimitives;

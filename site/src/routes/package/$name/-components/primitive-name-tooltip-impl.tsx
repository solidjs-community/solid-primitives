import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import {
  type Accessor,
  type Component,
  createRoot,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
} from "solid-js";
import { render } from "solid-js/web";
import { BASE } from "~/constants.js";
import type { BundlesizeItem } from "~/types.js";

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

const TooltipBody: Component<{
  data: BundlesizeItem;
  type: PrimitiveType;
  placement: Accessor<"top" | "bottom">;
}> = props => {
  const [target, setTarget] = createSignal<HTMLDivElement>();
  const [elSize, setElSize] = createSignal({ height: 0, width: 0 });

  createResizeObserver(
    () => (target() ? [target()!] : []),
    () => {
      const { height, width } = target()!.getBoundingClientRect();
      if (!(height > 0 && width > 0)) return;
      setElSize({ height, width });
    },
  );

  return (
    <div
      class="relative rounded-[9px] bg-[#2d466d] p-3 text-white dark:bg-[#a6c6df] dark:text-black"
      ref={setTarget}
    >
      <div class="mb-2">
        <h2 class="font-semibold opacity-80">Type</h2>
        <div class="text-[14px]">{TypeDescriptionContentMap[props.type]()}</div>
      </div>
      <div>
        <h2 class="font-semibold opacity-80">Size</h2>
        <div class="w-min">
          <div class="flex justify-between gap-2 whitespace-nowrap text-[14px]">
            Minified <span>{props.data.min}</span>
          </div>
          <div class="flex justify-between gap-2 whitespace-nowrap text-[14px]">
            GZipped <span>{props.data.gzip}</span>
          </div>
        </div>
      </div>

      <TooltipSVG width={elSize().width} height={elSize().height} placement={props.placement()} />
    </div>
  );
};

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
              d={`M -3,-0 v ${
                props.height + 3
              } h ${halfedWidthSection()} v -20 h ${widthOfArrow} v 20 h ${halfedWidthSection()} v -${
                props.height + 3
              } z`}
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

const HOVER_OPEN_DELAY = 100;
const HOVER_CLOSE_DELAY = 150;

/**
 * Attach a Floating UI–powered tooltip to `reference`. Lazily creates the
 * floating element on first hover, mounts a Solid root into it, disposes
 * everything on close. "Interactive" — won't close while the cursor is over
 * the floating element, so the user can click links inside the tooltip.
 */
function attachTooltip(
  reference: HTMLElement,
  data: BundlesizeItem,
  type: PrimitiveType,
): () => void {
  let floating: HTMLDivElement | undefined;
  let dispose: (() => void) | undefined;
  let stopAutoUpdate: (() => void) | undefined;
  let openTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const [placement, setPlacement] = createSignal<"top" | "bottom">("top");

  const update = () => {
    if (!floating) return;
    computePosition(reference, floating, {
      placement: "top",
      middleware: [offset(8), flip({ fallbackPlacements: ["bottom"] }), shift({ padding: 8 })],
    }).then(({ x, y, placement: p }) => {
      if (!floating) return;
      Object.assign(floating.style, { left: `${x}px`, top: `${y}px` });
      setPlacement(p === "bottom" ? "bottom" : "top");
    });
  };

  const cancelClose = () => {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = undefined;
  };

  const close = () => {
    stopAutoUpdate?.();
    stopAutoUpdate = undefined;
    dispose?.();
    dispose = undefined;
    floating?.remove();
    floating = undefined;
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer = setTimeout(close, HOVER_CLOSE_DELAY);
  };

  const open = () => {
    if (floating) return;
    floating = document.createElement("div");
    floating.style.cssText = "position:absolute;top:0;left:0;z-index:9999;";
    document.body.appendChild(floating);

    dispose = render(() => <TooltipBody data={data} type={type} placement={placement} />, floating);
    stopAutoUpdate = autoUpdate(reference, floating, update);

    // Track hover over the floating element too so "interactive" mode works —
    // moving the cursor from the reference into the tooltip must not close it.
    floating.addEventListener("mouseenter", cancelClose);
    floating.addEventListener("mouseleave", scheduleClose);
  };

  const cancelOpen = () => {
    if (openTimer) clearTimeout(openTimer);
    openTimer = undefined;
  };

  const scheduleOpen = () => {
    cancelClose();
    if (floating || openTimer) return;
    openTimer = setTimeout(() => {
      openTimer = undefined;
      open();
    }, HOVER_OPEN_DELAY);
  };

  const stopEnter = makeEventListener(reference, "mouseenter", scheduleOpen);
  const stopLeave = makeEventListener(reference, "mouseleave", () => {
    cancelOpen();
    if (floating) scheduleClose();
  });

  return () => {
    stopEnter();
    stopLeave();
    cancelOpen();
    cancelClose();
    close();
  };
}

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

      // Each tooltip lives in its own root so it can be torn down independently
      // when the surrounding readme element is removed (e.g. on route change).
      createRoot(disposeRoot => {
        const detach = attachTooltip(el, data, type);
        onCleanup(() => {
          detach();
          disposeRoot();
        });
      });
    }
  });
}

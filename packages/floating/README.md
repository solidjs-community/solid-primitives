<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=floating" alt="Solid Primitives floating">
</p>

# @solid-primitives/floating

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/floating?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/floating)
[![version](https://img.shields.io/npm/v/@solid-primitives/floating?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/floating)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Positioning for popovers, tooltips, dropdowns and other floating elements: placement, offset, flip, shift, available-space sizing and arrows, self-contained and with no positioning library underneath.

- [`computePosition`](#computeposition) - measure two elements and get coordinates back.
- [`computePositionFromRects`](#computepositionfromrects) - the same geometry on plain rects, with no DOM.
- [`makeAutoUpdate`](#makeautoupdate) - call `update` when scrolling, resizing or moving makes the position stale.
- [`createFloating`](#createfloating) - reactive positioning with styles, wired to auto-updating.
- [`getSizeCssVars` / `applySizeCssVars`](#size-css-variables) - expose the available space to CSS.

## Installation

```bash
npm install @solid-primitives/floating
# or
yarn add @solid-primitives/floating
# or
pnpm add @solid-primitives/floating
```

## `computePosition`

Computes where `floating` goes relative to `reference`. It measures with `getBoundingClientRect`, applies no styles and keeps no state. `x` / `y` are relative to the floating element's offset parent for `strategy: "absolute"` and to the viewport for `"fixed"`. A `"fixed"` element inside a transformed ancestor (`transform`, `perspective`, `filter`, `backdrop-filter`, `will-change` naming one of those, or `contain` / `container-type` that includes paint, layout, size) is positioned relative to that ancestor instead, since it is the containing block; the viewport is used when there is none. If the offset parent or containing block is scaled (e.g. `transform: scale(2)`), `x` / `y`, `availableWidth` / `availableHeight`, shift, arrow and `transformOrigin` px values are converted to its local CSS px, so they render at the same viewport place.

`flip` and `shift` are opt-in. `rootBoundary` defaults to the viewport (`visualViewport` when the browser has it); `boundary` narrows that further and is intersected with it.

```ts
// Type
function computePosition(
  reference: Element | VirtualElement,
  floating: HTMLElement,
  options?: {
    placement?: Placement; // "top" | "right" | "bottom" | "left", each with "-start" | "-end". Default "bottom"
    strategy?: "absolute" | "fixed"; // default "absolute"
    rtl?: boolean; // default: the floating element's computed `direction`
    offset?: number | { mainAxis?: number; crossAxis?: number };
    flip?: boolean | { fallbackPlacements?: Placement[]; padding?: Padding };
    shift?:
      | boolean
      | {
          padding?: Padding;
          crossAxis?: boolean; // default true
          mainAxis?: boolean; // default false
          limit?: boolean | { offset?: number };
        };
    size?: { padding?: Padding; apply?: (args: SizeApplyArgs) => void };
    arrow?: { element: Element | null; padding?: number };
    boundary?: Element | Element[] | Rect;
    rootBoundary?: "viewport" | "document" | Rect;
  },
): {
  x: number;
  y: number;
  placement: Placement; // the placement used, after flipping
  strategy: Strategy;
  middlewareData: {
    flipped: boolean;
    shifted: boolean;
    shift: { x: number; y: number };
    availableWidth: number;
    availableHeight: number;
    transformOrigin: string;
    arrow?: { x?: number; y?: number; centerOffset: number };
  };
};

// Example
import { computePosition } from "@solid-primitives/floating";

const { x, y, placement } = computePosition(button, tooltip, {
  placement: "top",
  offset: 8,
  flip: true,
  shift: { padding: 8 },
});
Object.assign(tooltip.style, { position: "absolute", left: `${x}px`, top: `${y}px` });
```

### Notes

- A virtual element is anything with `getBoundingClientRect()`, such as the pointer. Give it a `contextElement` so `makeAutoUpdate` can find its scroll ancestors.
- `flip` takes the first candidate (the requested placement, then `fallbackPlacements`, which defaults to the opposite side) whose side does not overflow. If none fits, it takes the one that overflows least.
- `shift.limit` keeps the floating element attached to the reference when the reference is scrolled out of the boundary.
- In RTL, `-start` / `-end` on `top` and `bottom` are mirrored. `left` and `right` placements are not affected.
- `size.apply` runs after the position is solved. If it changes the floating element's size, the position is solved once more.
- `arrow.x` / `arrow.y` are offsets inside the floating element along the cross axis; the arrow sits on the side opposite `placement`. `centerOffset` is non-zero when padding stopped it from pointing at the reference center.
- `availableWidth` / `availableHeight` are the room the floating element has before it hits the boundary, minus `size.padding`: on top/bottom placements the height is measured on the placement side, and the width towards the side the element can grow.

## `computePositionFromRects`

The geometry behind `computePosition`, on plain numbers. All rects share one coordinate space; `origin` converts the result into the coordinates of a positioned ancestor.

```ts
// Type
function computePositionFromRects(
  reference: Rect,
  floating: { width: number; height: number },
  clipping: Rect,
  options?: PositionOptions, // computePosition's options, without `arrow`, `boundary` and `rootBoundary`
  extras?: { origin?: Point; arrow?: { width: number; height: number; padding?: number } },
): ComputePositionResult;

// Example
import { computePositionFromRects } from "@solid-primitives/floating";

computePositionFromRects(
  { x: 400, y: 770, width: 100, height: 20 },
  { width: 60, height: 30 },
  { x: 0, y: 0, width: 1000, height: 800 },
  { placement: "bottom", flip: true },
); // { x: 420, y: 740, placement: "top", ... }
```

## `makeAutoUpdate`

Calls `update` while the position can go stale: when a scrollable ancestor of either element (or the window and visual viewport) scrolls, when the window resizes, and when either element changes size. Returns a cleanup. It does not call `update` on setup, and does nothing on the server.

Its signature matches `whileElementsMounted`, so it can be passed to `createFloating` as is. `autoUpdate` is an alias.

```ts
// Type
function makeAutoUpdate(
  reference: Element | VirtualElement,
  floating: HTMLElement,
  update: () => void,
  options?: {
    ancestorScroll?: boolean; // default true
    ancestorResize?: boolean; // default true
    elementResize?: boolean; // default true
    animationFrame?: boolean; // default false
  },
): () => void;

// Example
import { makeAutoUpdate, computePosition } from "@solid-primitives/floating";

const stop = makeAutoUpdate(button, tooltip, () => {
  const { x, y } = computePosition(button, tooltip, { placement: "top" });
  Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
});
// later
stop();
```

### Notes

- `animationFrame: true` checks the reference and floating boxes every frame and calls `update` only when they changed. Use it when the reference is animated, as scroll and resize events cannot see that.
- A `ResizeObserver` firing right after it starts observing triggers one extra `update`.

## `createFloating`

Reactive positioning. Every option may be a value or an accessor, and the position is recomputed when an element or option changes. On the server nothing is measured: `styles()` is the unpositioned `{ position, top: "0", left: "0" }`.

```ts
// Type
function createFloating(options: {
  reference: MaybeAccessor<Element | VirtualElement | null | undefined>;
  floating: MaybeAccessor<HTMLElement | null | undefined>;
  placement?: MaybeAccessor<Placement>;
  strategy?: MaybeAccessor<Strategy>;
  rtl?: MaybeAccessor<boolean>;
  offset?: MaybeAccessor<OffsetOptions>;
  flip?: MaybeAccessor<boolean | FlipOptions>;
  shift?: MaybeAccessor<boolean | ShiftOptions>;
  size?: MaybeAccessor<SizeOptions>;
  arrow?: MaybeAccessor<{ element: MaybeAccessor<Element | null | undefined>; padding?: number }>;
  boundary?: MaybeAccessor<Boundary>;
  rootBoundary?: MaybeAccessor<RootBoundary>;
  transform?: MaybeAccessor<boolean>; // translate() instead of top/left, default true
  whileElementsMounted?: (reference, floating, update) => (() => void) | void;
  autoUpdate?: MaybeAccessor<boolean | AutoUpdateOptions>; // shorthand for makeAutoUpdate
}): {
  x: Accessor<number>;
  y: Accessor<number>;
  placement: Accessor<Placement>;
  strategy: Accessor<Strategy>;
  middlewareData: Accessor<MiddlewareData | undefined>;
  isPositioned: Accessor<boolean>;
  styles: Accessor<{ position: Strategy; top: string; left: string; transform?: string }>;
  update: () => void;
};

// Example
import { createSignal } from "solid-js";
import { createFloating } from "@solid-primitives/floating";

function Tooltip() {
  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);

  const position = createFloating({
    reference,
    floating,
    placement: "top",
    offset: 8,
    flip: true,
    shift: { padding: 8 },
    autoUpdate: true,
  });

  return (
    <>
      <button ref={setReference}>Hover me</button>
      <div ref={setFloating} style={position.styles()}>
        {position.placement()}
      </div>
    </>
  );
}
```

### Notes

- Pass the elements as signals (`ref={setReference}`) so a new element repositions.
- `whileElementsMounted` runs while both elements exist and is cleaned up when one goes away or the owner is disposed. Option changes do not restart it. It wins over `autoUpdate`.
- `styles()` values are rounded to the device pixel ratio to keep text sharp. Read `x()` / `y()` for the exact numbers.
- `isPositioned()` is `false` until the first measurement, so you can hide the element until then.
- `update()` is safe to call from event handlers and does nothing when an element is missing.
- The position signals only change when the result differs, so polling with `animationFrame` does not cause extra updates.

## Size CSS variables

`getSizeCssVars` turns `middlewareData` into `--available-width`, `--available-height` and `--transform-origin`; `applySizeCssVars` writes them to an element's inline style.

```ts
// Type
function getSizeCssVars(
  data: Pick<MiddlewareData, "availableWidth" | "availableHeight" | "transformOrigin">,
): Record<"--available-width" | "--available-height" | "--transform-origin", string>;
function applySizeCssVars(element: HTMLElement, data: typeof data): void;

// Example
const position = createFloating({ reference, floating, flip: true });

<div
  ref={setFloating}
  style={{
    ...position.styles(),
    ...(position.middlewareData() && getSizeCssVars(position.middlewareData()!)),
    "max-height": "var(--available-height)",
    "transform-origin": "var(--transform-origin)",
  }}
/>;
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

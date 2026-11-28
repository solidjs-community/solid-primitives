<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=floating" alt="Solid Primitives floating">
</p>

# @solid-primitives/floating

[![size](https://img.shields.io/badge/size-4.71_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/floating)
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

Computes where `floating` goes relative to `reference`. It measures with `getBoundingClientRect`, applies no styles and keeps no state. `x` / `y` are relative to the floating element's offset parent for `strategy: "absolute"` and to the viewport for `"fixed"`. A `"fixed"` element inside a transformed ancestor (see [Containing blocks](#containing-blocks)) is positioned relative to that ancestor instead, since it is the containing block, and the ancestor's own scroll offset is taken into account; the viewport is used when there is none. The same triggers on a static `body` or on `html` make it the containing block for `"absolute"` elements, and so does a positioned `html` (`position` other than `static`): its padding box is then the origin, so margin, border and `left` / `top` offsets on `html` are accounted for. The scale is inferred from the ancestor's bounding box versus its `offsetWidth` / `offsetHeight`; a difference of 1px or less is treated as rounding, so a real transform that changes the size by 1px or less is not detected. If the offset parent or containing block is scaled (e.g. `transform: scale(2)`), `x` / `y`, `availableWidth` / `availableHeight`, shift, arrow and `transformOrigin` px values are converted to its local CSS px, so they render at the same viewport place. Only translation and positive scale are compensated; for rotation, skew or mirrored scale see [Limitations](#limitations).

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

// Position it before measuring, so the measurement and the applied coordinates share a context
Object.assign(tooltip.style, { position: "absolute", left: "0", top: "0" });
const { x, y, placement } = computePosition(button, tooltip, {
  placement: "top",
  offset: 8,
  flip: true,
  shift: { padding: 8 },
});
Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
```

### Notes

- A virtual element is anything with `getBoundingClientRect()`, such as the pointer. Give it a `contextElement` so `makeAutoUpdate` can find its scroll ancestors.
- `flip` takes the first candidate (the requested placement, then `fallbackPlacements`, which defaults to the opposite side) whose side does not overflow. If none fits, it takes the one that overflows least.
- `shift.limit` keeps the floating element attached to the reference when the reference is scrolled out of the boundary.
- In RTL, `-start` / `-end` on `top` and `bottom` are mirrored. `left` and `right` placements are not affected.
- In RTL, the sign of the cross-axis `offset` is flipped on `top` and `bottom` placements, following the floating-ui convention: a positive `crossAxis` moves the element towards the inline end (to the left).
- `size.apply` runs after the position is solved. If it changes the floating element's size, the position is solved once more.
- `arrow.x` / `arrow.y` are offsets inside the floating element along the cross axis; the arrow sits on the side opposite `placement`. `centerOffset` is non-zero when padding stopped it from pointing at the reference center. The padding never exceeds half of the room left by the arrow, so on a floating element smaller than the arrow plus twice the padding the arrow still sits inside it.
- `availableWidth` / `availableHeight` are the room the floating element has before it hits the boundary, minus `size.padding`: on top/bottom placements the height is measured on the placement side, and the width towards the side the element can grow.

### Containing blocks

An element with one of these styles is the containing block of its `position: fixed` (and `position: absolute`) descendants, so their `x` / `y` are measured from it:

| Trigger                                                                                                                                                                                  | Notes                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transform`, `translate`, `rotate`, `scale`, `perspective`                                                                                                                               | any value other than `none`; `rotate`, or a `transform` containing rotation, makes the block a containing block but the rotation is not inverted (see [Limitations](#limitations)) |
| `filter`, `backdrop-filter`                                                                                                                                                              | not on `html`: the root element is not a containing block for them                                                                                                                 |
| `contain` with `paint`, `layout`, `strict` or `content`                                                                                                                                  | `size` and `style` alone do not count                                                                                                                                              |
| `offset-path` other than `none`                                                                                                                                                          | includes `ray()`                                                                                                                                                                   |
| `content-visibility: auto` or `hidden`                                                                                                                                                   |                                                                                                                                                                                    |
| `transform-style: preserve-3d`                                                                                                                                                           |                                                                                                                                                                                    |
| `will-change` naming `transform`, `translate`, `rotate`, `scale`, `perspective`, `filter`, `backdrop-filter`, `contain`, `offset-path`, `offset`, `offset-position` or `transform-style` | matched per token, so `transform-origin` and `perspective-origin` do not count; `filter` / `backdrop-filter` are ignored on `html`                                                 |

`container-type` and the prefixed `-webkit-backdrop-filter` are not triggers. This table was verified in Chrome 158 only (`html` and `body`, one property at a time) and may differ in Safari and Firefox.

An element with `display: contents` generates no box, so none of these styles (and not `position` either) make it a containing block; it is skipped and the next ancestor is used. A `display: contents` slot wrapper around a positioned host therefore resolves to the host.

Elements in the top layer (an open `popover`, a modal `dialog`, a fullscreen element) ignore all of this: with `strategy: "fixed"` they are measured from the viewport, with `"absolute"` from the document, whatever their ancestors are styled with.

### Limitations

- CSS `zoom` is not supported. An element inside a `zoom`ed subtree, or one that is `zoom`ed itself, ends up off by the zoom factor.
- Rotation, skew and negative or mirrored scale (`scale(-1, 1)`) are not supported. Only translation and positive scale of the containing block are inverted, so a rotated or skewed containing block, for example with `bottom-start`, lands off by an amount that grows with the angle and the distance from the transform origin. Render the floating element in a portal to `body` instead.
- `makeAutoUpdate` does not see a reference that moves without resizing (a layout shift, a CSS `transform` or a transition) unless `animationFrame` is `true`. An ancestor that becomes scrollable after setup does not get a scroll listener. One window resize can call `update` about twice (the window `resize` plus the `visualViewport` `resize`), so keep `update` cheap and idempotent.
- With a classic scrollbar on the left in an RTL document the visible area starts after the scrollbar; this is accounted for unless the page is pinch-zoomed.
- Fractional layout sizes inside a scaled containing block can be off by a sub-pixel.

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

Object.assign(tooltip.style, { position: "absolute", left: "0", top: "0" });
const update = () => {
  const { x, y } = computePosition(button, tooltip, { placement: "top" });
  Object.assign(tooltip.style, { left: `${x}px`, top: `${y}px` });
};
update(); // makeAutoUpdate does not call update on setup
const stop = makeAutoUpdate(button, tooltip, update);
// later
stop();
```

### Notes

- `animationFrame: true` checks the reference and floating boxes every frame and calls `update` only when they changed. Use it when the reference is animated, as scroll and resize events cannot see that.
- A `ResizeObserver` firing right after it starts observing may trigger one extra `update`, but that is not guaranteed (`elementResize: false`, a hidden element, no `ResizeObserver`), so call `update` once yourself.

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

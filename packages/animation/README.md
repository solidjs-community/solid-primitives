<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=animation" alt="Solid Primitives animation">
</p>

# @solid-primitives/animation

[![version](https://img.shields.io/npm/v/@solid-primitives/animation?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/animation)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Solid primitives for the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) (WAAPI). Each primitive follows the `make` / `create`.
## Installation

```bash
npm install @solid-primitives/animation
# or
pnpm add @solid-primitives/animation
```

## Primitives

| Primitive | Description |
|---|---|
| [`makeAnimate`](#makeanimate--createanimate) | Imperative `element.animate()` wrapper |
| [`createAnimate`](#makeanimate--createanimate) | Reactive `makeAnimate` |
| [`makeScrollAnimation`](#makescrollanimation--createscrollanimation) | Scroll-driven animation via `ScrollTimeline` |
| [`createScrollAnimation`](#makescrollanimation--createscrollanimation) | Reactive `makeScrollAnimation` |
| [`makeViewAnimation`](#makeviewanimation--createviewanimation) | Viewport-driven animation via `ViewTimeline` |
| [`createViewAnimation`](#makeviewanimation--createviewanimation) | Reactive `makeViewAnimation` |
| [`makeFlip`](#makeflip) | FLIP layout animation |
| [`makeStagger`](#makestagger--createstagger) | Staggered animations across a list of elements |
| [`createStagger`](#makestagger--createstagger) | Reactive `makeStagger` |
| [`makeAnimationGroup`](#makeanimationgroup--createanimationgroup) | Coordinate multiple animations as a unit |
| [`createAnimationGroup`](#makeanimationgroup--createanimationgroup) | Reactive `makeAnimationGroup` |
| [`createPresenceAnimation`](#createpresenceanimation) | Mount/unmount lifecycle with WAAPI enter/exit animations |

---

## `makeAnimate` / `createAnimate`

`makeAnimate` is a thin wrapper around `element.animate()` with TypeScript types. `createAnimate` replays the animation whenever `target`, `keyframes`, or `options` change reactively, and cancels it when the owner disposes.

```ts
// Imperative
const anim = makeAnimate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
anim.pause();

// Reactive
const anim = createAnimate(
  () => ref,
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 300, fill: "forwards" },
);
// anim() is the current Animation instance, or undefined while ref is unset
anim()?.pause();
```

```ts
function makeAnimate(
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: KeyframeAnimationOptions,
): Animation

function createAnimate(
  target: Accessor<Element | null | undefined>,
  keyframes: MaybeAccessor<Keyframe[] | PropertyIndexedKeyframes | null>,
  options?: MaybeAccessor<KeyframeAnimationOptions>,
): Accessor<Animation | undefined>
```

---

## `makeScrollAnimation` / `createScrollAnimation`

Plays a WAAPI animation whose progress is driven by scroll position via [`ScrollTimeline`](https://developer.mozilla.org/en-US/docs/Web/API/ScrollTimeline). No scroll listeners or RAF loops needed.

```ts
// Fade + rise as the user scrolls down the page
const anim = createScrollAnimation(
  () => ref,
  [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }],
  { fill: "both" },
);

// Tie progress to a specific scroll container
const anim = createScrollAnimation(() => ref, keyframes, {
  fill: "both",
  source: scrollContainerEl,
  axis: "block",
});
```

```ts
type ScrollAnimationOptions = Omit<KeyframeAnimationOptions, "timeline"> & {
  source?: Element;    // scroll container — defaults to document root scroller
  axis?: "block" | "inline" | "x" | "y";
};

function makeScrollAnimation(
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: ScrollAnimationOptions,
): Animation

function createScrollAnimation(
  target: Accessor<Element | null | undefined>,
  keyframes: MaybeAccessor<Keyframe[] | PropertyIndexedKeyframes | null>,
  options?: MaybeAccessor<ScrollAnimationOptions>,
): Accessor<Animation | undefined>
```

---

## `makeViewAnimation` / `createViewAnimation`

Plays a WAAPI animation whose progress is driven by an element's intersection with the scroll port via [`ViewTimeline`](https://developer.mozilla.org/en-US/docs/Web/API/ViewTimeline). Replaces the IntersectionObserver + class-toggle pattern.

```ts
// Animate the element itself as it enters the viewport
const anim = createViewAnimation(
  () => ref,
  [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
  { fill: "both" },
);

// Observe a different element than the one being animated
const anim = createViewAnimation(() => animatedEl, keyframes, {
  fill: "both",
  subject: triggerEl,
  inset: "0px 0px -100px 0px",
});
```

```ts
type ViewAnimationOptions = Omit<KeyframeAnimationOptions, "timeline"> & {
  subject?: Element;             // element to observe — defaults to target
  axis?: "block" | "inline" | "x" | "y";
  inset?: string | string[];     // shrinks/expands the intersection root
};

function makeViewAnimation(
  el: Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: ViewAnimationOptions,
): Animation

function createViewAnimation(
  target: Accessor<Element | null | undefined>,
  keyframes: MaybeAccessor<Keyframe[] | PropertyIndexedKeyframes | null>,
  options?: MaybeAccessor<ViewAnimationOptions>,
): Accessor<Animation | undefined>
```

---

## `makeFlip`

FLIP (First–Last–Invert–Play) layout animation. Call `snapshot()` before the DOM change to record the element's current geometry, then call `flip()` after to animate from the old position/size to the new one.

```tsx
let el!: HTMLUListElement;
const { snapshot, flip } = makeFlip(el, { duration: 300, easing: "ease" });

const handleReorder = () => {
  snapshot();
  setItems(prev => [...prev].reverse()); // DOM updates synchronously
  flip();
};

return <ul ref={el}>...</ul>;
```

`flip()` is a no-op if `snapshot()` was never called or if the geometry didn't change. It resets the captured rect after each call, so a second `flip()` without a new `snapshot()` is always a no-op.

> **Note:** geometry is measured via `getBoundingClientRect` (viewport coordinates). Elements inside `position: fixed` or `position: absolute` ancestors may need coordinate adjustment.

```ts
function makeFlip(
  el: Element,
  options?: KeyframeAnimationOptions,
): { snapshot: () => void; flip: () => Animation | undefined }
```

---

## `makeStagger` / `createStagger`

Applies a WAAPI animation to a list of elements with a per-element delay offset. The `stagger` option is added on top of the base `delay`.

```ts
// Imperative — animate a static list of elements
makeStagger(listItems, [{ opacity: 0 }, { opacity: 1 }], {
  duration: 400,
  stagger: 60,
});

// Reactive — re-runs (cancelling previous animations) when the target list changes
const itemRefs: HTMLLIElement[] = [];

const anims = createStagger(
  () => itemRefs,
  [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
  { duration: 400, stagger: 60, easing: "ease-out" },
);
```

```ts
type StaggerOptions = KeyframeAnimationOptions & {
  stagger?: number; // ms added per element on top of `delay`
};

function makeStagger(
  els: Element[],
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  options?: StaggerOptions,
): Animation[]

function createStagger(
  targets: Accessor<(Element | null | undefined)[]>,
  keyframes: MaybeAccessor<Keyframe[] | PropertyIndexedKeyframes | null>,
  options?: MaybeAccessor<StaggerOptions>,
): Accessor<Animation[]>
```

---

## `makeAnimationGroup` / `createAnimationGroup`

Coordinates a list of `Animation` objects as a single unit. All five control methods are forwarded to every non-null animation simultaneously. Pairs naturally with `makeAnimate` and `makeStagger`.

`makeAnimationGroup` takes a static array. `createAnimationGroup` takes an accessor and re-derives the group whenever the list changes — each control method always operates on the most recent set of animations.

```ts
// Imperative — static list
const header = makeAnimate(headerEl, fadeIn, { duration: 300 });
const body   = makeAnimate(bodyEl,   fadeIn, { duration: 300, delay: 100 });
const footer = makeAnimate(footerEl, fadeIn, { duration: 300, delay: 200 });

const group = makeAnimationGroup([header, body, footer]);

group.pause();
group.play();
group.cancel();
```

```tsx
// Reactive — list changes when items() changes
const itemRefs: HTMLLIElement[] = [];
const [items, setItems] = createSignal(data);

const anims = createStagger(
  () => itemRefs,
  [{ opacity: 0 }, { opacity: 1 }],
  { duration: 300, stagger: 40 },
);

// group.play() / pause() always targets the animations from the latest render
const group = createAnimationGroup(anims);

return (
  <button onClick={() => group.play()}>Play all</button>
  <ul>
    <For each={items()}>
      {(item, i) => <li ref={itemRefs[i()]}>{item.name}</li>}
    </For>
  </ul>
);
```

```ts
type AnimationGroupControls = {
  play: () => void;
  pause: () => void;
  cancel: () => void;
  reverse: () => void;
  finish: () => void;
};

function makeAnimationGroup(
  animations: (Animation | null | undefined)[],
): AnimationGroupControls

function createAnimationGroup(
  animations: Accessor<(Animation | null | undefined)[]>,
): AnimationGroupControls
```

---

## `createPresenceAnimation`

Manages mount/unmount lifecycle with WAAPI enter and exit animations. Pass a `target` ref accessor, a `show` signal, and enter/exit keyframes. The returned `isMounted` accessor should gate the element's presence in the DOM — the element stays mounted until its exit animation finishes.

Exit keyframes default to the enter keyframes reversed. If `show` toggles back to `true` while an exit is in progress, the exit is cancelled and the enter restarts.

```tsx
const [show, setShow] = createSignal(false);
let el!: HTMLDivElement;

const { isMounted } = createPresenceAnimation(() => el, show, {
  enter: [
    { opacity: 0, transform: "translateY(8px)" },
    { opacity: 1, transform: "none" },
  ],
  enterOptions: { duration: 250, easing: "ease-out" },
  // exit defaults to reversed enter — fade out and slide down
});

return (
  <>
    <button onClick={() => setShow(v => !v)}>Toggle</button>
    <Show when={isMounted()}>
      <div ref={el}>Hello</div>
    </Show>
  </>
);
```

```tsx
// Separate enter and exit keyframes + options
const { isMounted } = createPresenceAnimation(() => el, show, {
  enter: [{ opacity: 0, transform: "scale(0.95)" }, { opacity: 1, transform: "none" }],
  exit:  [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.95)" }],
  enterOptions: { duration: 200, easing: "ease-out" },
  exitOptions:  { duration: 150, easing: "ease-in" },
});
```

```ts
type PresenceAnimationOptions = {
  enter: Keyframe[] | PropertyIndexedKeyframes | null;
  exit?: Keyframe[] | PropertyIndexedKeyframes | null;  // defaults to reversed enter
  enterOptions?: KeyframeAnimationOptions;
  exitOptions?: KeyframeAnimationOptions;               // defaults to enterOptions
  initialEnter?: boolean;                               // animate on first mount (default: false)
};

function createPresenceAnimation(
  target: Accessor<HTMLElement | null | undefined>,
  show: MaybeAccessor<boolean>,
  options: PresenceAnimationOptions,
): { isMounted: Accessor<boolean> }
```

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Related

- [`@solid-primitives/presence`](https://www.npmjs.com/package/@solid-primitives/presence) — mount/unmount lifecycle coordination for CSS transitions
- [`@solid-primitives/transition-group`](https://www.npmjs.com/package/@solid-primitives/transition-group) — `<TransitionGroup>` for lists
- [`@solid-primitives/spring`](https://www.npmjs.com/package/@solid-primitives/spring) — spring-physics value interpolation
- [`@solid-primitives/tween`](https://www.npmjs.com/package/@solid-primitives/tween) — tween value interpolation

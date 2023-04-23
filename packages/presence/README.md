# @solid-primitives/presence

## [Example](https://stackblitz.com/edit/solidjs-templates-8eqpxz?file=src%2FApp.tsx)

A small SolidJS utility to animate the presence of an element. Inspired by & directly forked from [`use-presence`](https://www.npmjs.com/package/use-presence).

## The problem

There are two problems that you have to solve when animating the presence of an element:

1. During enter animations, you have to render an initial state where the element is hidden and only after the latest state has propagated to the DOM, you can can animate the final state that the element should animate towards.
2. Exit animations are a bit tricky in SolidJS, since this typically means that a component unmounts. However when the component has already unmounted, you can't animate it anymore. A workaround is often to keep the element mounted, but that keeps unnecessary elements around and can hurt accessibility, as hidden interactive elements might still be focusable.

## This solution

This utility provides a lightweight solution where the animating element is only mounted the minimum of time, while making sure the animation is fully visible to the user. The rendering is left to the user to support all kinds of styling solutions.

## Example

```tsx
const FirstExample = () => {
  const [showStuff, setShowStuff] = createSignal(true);
  const { isVisible, isMounted } = createPresenceSignal(showStuff, {
    transitionDuration: 500,
  });

  return (
    <div
      style={{
        padding: "2em",
        margin: "2em",
        "border-radius": "2em",
        "box-shadow": "-5px 0px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <button onclick={() => setShowStuff(!showStuff())}>{`${
        showStuff() ? "Hide" : "Show"
      } stuff`}</button>
      <Show when={isMounted()}>
        <div
          style={{
            transition: "all .5s ease",
            opacity: isVisible() ? "1" : "0",
            transform: isVisible() ? "translateX(0)" : "translateX(50px)",
          }}
        >
          I am the stuff!
        </div>
      </Show>
    </div>
  );
};
```

## API

```tsx
type Options = {
  /** Duration in milliseconds used both for enter and exit transitions. */
  transitionDuration: number;
  /** Duration in milliseconds used for enter transitions (overrides `transitionDuration` if provided). */
  enterDuration: number;
  /** Duration in milliseconds used for exit transitions (overrides `transitionDuration` if provided). */
  exitDuration: number;
  /** Opt-in to animating the entering of an element if `isVisible` is `true` during the initial mount. */
  initialEnter?: boolean;
};
createPresenceSignal(
  /** Indicates whether the component that the resulting values will be used upon should be visible to the user. */
  isVisible: Accessor<boolean>,
  /** Options may be a signal getter if you need to update it */
  opts: Options | Accessor<Options>
): {
  /** Should the component be returned from render? */
  isMounted: Accessor<boolean>;
  /** Should the component have its visible styles applied? */
  isVisible: Accessor<boolean>;
  /** Is the component either entering or exiting currently? */
  isAnimating: Accessor<boolean>;
  /** Is the component entering currently? */
  isEntering: Accessor<boolean>;
  /** Is the component exiting currently? */
  isExiting: Accessor<boolean>;
}
```

## `createPresenceSwitchSignal`

If you have multiple items where only one is visible at a time, you can use the supplemental `createPresenceSwitchSignal` utility to animate the items in and out. Previous items will exit before the next item transitions in.

### API

```tsx
createPresenceSwitchSignal<ItemType>(
  /** The current item that should be visible. If `undefined` is passed, the previous item will animate out. */
  item: Accessor(ItemType | undefined>,
  /** The same `opts` argument of `createPresenceSignal`. */
  opts: Options | Accessor<Options>
): {
  /** The item that should currently be rendered. */
  mountedItem: Accessor<ItemType | undefined>;
  /** Returns all other properties from `createPresenceSignal`. */
  ...rest
}
```

### Example

```tsx
const SecondExample = () => {
  const items = ["foo", "bar", "baz", "qux"];
  const [item, setItem] = createSignal<(typeof items)[number] | undefined>(items[0]);
  const { isMounted, mountedItem, isEntering, isVisible, isExiting } = createPresenceSwitchSignal(
    item,
    {
      transitionDuration: 500,
    },
  );

  return (
    <div
      style={{
        padding: "2em",
        margin: "2em",
        "border-radius": "2em",
        "box-shadow": "-5px 0px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <For each={items}>
        {currItem => (
          <button
            onclick={() => {
              if (item() === currItem) {
                setItem(undefined);
              } else {
                setItem(currItem);
              }
            }}
          >
            {currItem}
          </button>
        )}
      </For>
      <Show when={isMounted()}>
        <div
          style={{
            transition: "all .5s linear",
            ...(isEntering() && {
              opacity: "0",
              transform: "translateX(-25px)",
            }),
            ...(isExiting() && {
              opacity: "0",
              transform: "translateX(25px)",
            }),
            ...(isVisible() && {
              opacity: "1",
              transform: "translateX(0)",
            }),
          }}
        >
          {mountedItem()}
        </div>
      </Show>
    </div>
  );
};
```

## Related

- [`use-presence`](https://www.npmjs.com/package/use-presence)
- [`AnimatePresence` of `framer-motion`](https://www.framer.com/docs/animate-presence/)
- [`Transition` of `react-transition-group`](http://reactcommunity.org/react-transition-group/transition)

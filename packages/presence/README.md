<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=presence" alt="Solid Primitives presence">
</p>

# @solid-primitives/presence

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/presence?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/presence)
[![version](https://img.shields.io/npm/v/@solid-primitives/presence?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/presence)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

## Installation

```bash
npm install @solid-primitives/presence
# or
yarn add @solid-primitives/presence
# or
pnpm add @solid-primitives/presence
```

A small, reactive utility to exert stronger control over an element's presence in the DOM in order to apply enter and exit transitions/animations.

## How to use it?

```typescript
const App = () => {
  const [show, setShow] = createSignal(true);
  const state = createPresence(show, { duration: 300, initialRun: true });
  const isMounted = createMemo(() => state() !== "exited");

  return (
    <div>
      <div>
        <button onClick={() => setShow(p => !p)}>{show() ? "Hide" : "Show"}</button>
      </div>
      <Show when={isMounted()}>
        <div
          style={{
            transition: "all .3s linear",

            ...(state() === "initial" && {
              opacity: "0",
              transform: "translateX(-25px)",
            }),

            ...(state() === "entering" && {
              opacity: "1",
              transform: "translateX(0)",
            }),

            ...(state() === "exiting" && {
              opacity: "0",
              transform: "translateX(25px)",
            }),
          }}
        >
          Hello World!
        </div>
      </Show>
    </div>
  );
};
```

Here is how to run css animations:

```css
.hidden {
  opacity: 0;
}

.fadein {
  animation: 0.5s linear fadein;
}

.fadeout {
  animation: 0.5s linear fadeout;
}

@keyframes fadein {
  0% {
    opacity: 0;
    color: red;
  }
  100% {
    opacity: 1;
    color: green;
  }
}

@keyframes fadeout {
  0% {
    opacity: 1;
    color: green;
  }
  100% {
    opacity: 0;
    color: blue;
  }
}
```

```typescript
 <Show when={isMounted()}>
  <div
    classList={{
      hidden: state() === 'initial',
      fadein: state() === 'entering',
      fadeout: state() === 'exiting',
    }}
  >
    Hello World!
  </div>
</Show>
```



## How it works?

When an elements visibilty tied to a signal, the elements gets mounted and unmounted abruptly, not permitting to apply any css transitions.

```ts
<Show when={show()}>
  <div>Hello World!</div>
</Show>
```

`createPresence` creates a derived signal, through which we transition from `false` to `true` in two steps, `entering` and `entered`, and again from `true` to `false` in two steps `exiting` and `exited`.

```ts
const [show, setShow] = createSignal(true);

const state = createPresence(show, {
  duration: 500,
  initialTransition: true,
});
```

This allows us to apply enter and exit transitions on an element but first we need to hand over the control of the element's visibilty to the `state`:

```ts
const isMounted = () => state() !== 'exited';
<Show when={isMounted()}>
  <div>Hello World!</div>
</Show>
```

`createPresence` returns a derived signal with five states, three of them being resting states, `initial`, `entered`, `exited` and two of them being transitioning states, `entering` and `exiting`.

```ts
type State = "initial" | "entering" | "entered" | "exiting" | "exited";
```

Element is mounted at `initial` state. This state is short-lived since `entering` is flushed immediately via event loop however it can be used to set css properties.

When `show` is set to `true`, component gets mounted at `initial` state which changes to `entering` almost immediately and remain there for the duration of `500ms`, then moves to `entered` state and remain there indefinitely.

This allow us to transition from a property loaded with `entering` state to the one loaded with `entered` state:

```ts
<div
  style={{
    transition: 'all .5s linear',
    
    ...(state() === 'entering' && {
      color: 'green',
    }),
    
    ...(state() === 'entered' && {
      color: 'red',
    }),
  }}
>
  Hello World!
</div>
```

Now, when `show` is set to `false`, the `div` elemement does not disappear immediately but waits for the duration of `exiting` state. In other words, we extended element's presence in the DOM for `500ms` which allows us to apply exit transitions:

```ts
<div
  style={{
    transition: 'all .5s linear',
  
    ...(state() === 'exiting' && {
      color: 'orange',
    }),
    
    ...(state() === 'exited' && {
      color: 'blue',
    }),
  }}
>
  Hello World!
</div>
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
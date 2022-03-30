<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Media" alt="Solid Primitives">
</p>

# @solid-primitives/media

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/media?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/media)
[![size](https://img.shields.io/npm/v/@solid-primitives/media?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/media)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Collection of reactive primitives to deal with media queries.

- [`createMediaQuery`](#createMediaQuery) - Creates a very simple and straightforward media query monitor.
- [`createBreakpoints`](#createBreakpoints) - Creates a multi-breakpoint monitor to make responsive components easily.

## Installation

```
npm install @solid-primitives/media
# or
yarn add @solid-primitives/media
```

## Reactive Primitives:

### `createMediaQuery`

Creates a very simple and straightforward media query monitor.

```ts
import { createMediaQuery } from "@solid-primitives/media";

const isSmall = createMediaQuery("(max-width: 767px)");
console.log(isSmall());
```

[Working Demo](https://codesandbox.io/s/solid-media-query-5bf16?file=/src/index.tsx)

### `createBreakpoints`

Creates a multi-breakpoint monitor to make responsive components easily.

```tsx
import { createBreakpoints } from "@solid-primitives/media";

const breakpoints = {
  sm: "640px",
  lg: "1024px",
  xl: "1280px"
};

const Example: Component = () => {
  const matches = createBreakpoints(breakpoints);

  createEffect(() => {
    console.log(matches.sm); // true when screen width >= 640px
    console.log(matches.lg); // true when screen width >= 1024px
    console.log(matches.xl); // true when screen width >= 1280px
  });

  return (
    <div
      classList={{
        "text-tiny flex flex-column": true, // tiny text with flex column layout
        "text-small": matches.sm, // small text with flex column layout
        "text-base flex-row": matches.lg, // base text with flex row layout
        "text-huge": matches.xl // huge text with flex row layout
      }}
    >
      <Switch fallback={<div>Smallest</div>}>
        <Match when={matches.xl}>Extra Large</Match>
        <Match when={matches.lg}>Large</Match>
        <Match when={matches.sm}>Small</Match>
        {/* 
          Instead of fallback, you can also use `!matches.sm`
          <Match when={!matches.sm}>Smallest</Match>
         */}
      </Switch>
    </div>
  );
};
```

[Working Demo](https://codesandbox.io/s/solid-responsive-breakpoints-h4emy8?file=/src/index.tsx)

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release.

1.0.0

Shipped first stable version.

1.1.7

Published with CJS and SSR support.

1.1.10

Added server entry and updated to latest Solid.

1.1.11

Removed onMount and returned the current media query immediately as opposed to onEffect.

1.2.0

Added createBreakpoints primitive as an alpha release.

</details>

## Contributors

Thanks to Aditya Agarwal for contributing createBreakpoints.

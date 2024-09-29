<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=start" alt="Solid Primitives start">
</p>

# @solid-primitives/start

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/start?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/start)
[![version](https://img.shields.io/npm/v/@solid-primitives/start?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/start)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A set of primitives for Solid Start

- [`createServerCookie`](#createservercookie) - Provides a getter and setter for a reactive cookie, which works isomorphically.
- [`createUserTheme`](#createusertheme) - Creates a Server Cookie providing a type safe way to store a theme and access it on the server or client.

## Installation

```bash
npm install @solid-primitives/start
# or
yarn add @solid-primitives/start
# or
pnpm add @solid-primitives/start
```

## How to use it

## `createServerCookie`

A primitive for creating a cookie that can be accessed isomorphically on the client, or the server.

```ts
const [cookie, setCookie] = createServerCookie("cookieName");

cookie(); // => string | undefined
```

### Custom serialization

Custom cookie serializers and deserializers can also be implemented

```ts
const [serverCookie, setServerCookie] = createServerCookie("coolCookie", {
  deserialize: str => (str ? str.split(" ") : []), // Deserializes cookie into a string[]
  serialize: val => (val ? val.join(" ") : ""), // serializes the value back into a string
});

serverCookie(); // => string[]
```

## `createUserTheme`

Composes `createServerCookie` to provide a type safe way to store a theme and access it on the server or client.

```ts
const [theme, setTheme] = createUserTheme("cookieName");

theme(); // => "light" | "dark" | undefined

// with default value
const [theme, setTheme] = createUserTheme("cookieName", {
  defaultValue: "light",
});

theme(); // => "light" | "dark"
```

## Examples

### `root.tsx`

This is the main entry file for SolidStart demonstrating usage of the `createUserTheme` function.

- Initializes the theme with the `createUserTheme` function.
- Toggles between the "dark" and "light" themes using a button.
- Sets the `data-theme` attribute adding compatibility between `createUserTheme` and libraries like [DaisyUI](https://daisyui.com/).
- Includes a clean implementation of theming through a `Body` class.
- Provides additional examples on using variant classes to style components.

```tsx
import { Suspense } from "solid-js";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import Counter from "./components/Counter";
import "./root.css";
import { createUserTheme } from "~/primitives/start";

export default function Root() {
  const [theme, setTheme] = createUserTheme("dark-light-theme", { defaultValue: "dark" });
  const toggleTheme = () => setTheme(currentTheme => (currentTheme === "dark" ? "light" : "dark"));

  return (
    // Set data-theme when using libraries like Daisyui:
    <Html lang="en" data-theme={theme()}>
      <Head>
        <Title>SolidStart - Bare</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      // Apply theme as a class to the Body element:
      <Body class={theme()}>
        <div>
          <Counter
            classList={{
              // Within components apply theme-dependent classes/variants:
              "dark-variant": theme() !== "light",
              "light-variant": theme() === "light",
            }}
          />
          <button onClick={toggleTheme}>
            <span>Toggle Theme</span>
          </button>
        </div>
        <Scripts />
      </Body>
    </Html>
  );
}
```

### `root.css`

Here is an absolute basic CSS file to demonstrate styling with the themes.

- The `body` selector has general styles.
- The `.dark` and `.light` classes provide specific styles for each theme.
- The `.dark span` and `.light span` selectors show how to style specific elements based on the theme.

```css
body {
  font-family: Gordita, Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  height: "100vh";
  width: "100vh";
}

body.dark {
  background-color: black;
  color: aliceblue;
}
body.light {
  background-color: aliceblue;
  color: black;
}

.dark span {
  color: #b1d4ff;
}
.light span {
  color: #003677;
}
```

### `Counter.css`

Continuation of the basic CSS scoped to the component using variant classes.

```css
.dark-variant {
  border: 2px solid #569cf3;
}

.light-variant {
  border: 2px solid #05ff22;
}
```

## Demo

You can view a demo of this primitive here: <https://codesandbox.io/p/sandbox/amazing-easley-wqk38i?file=%2Fsrc%2Fstart_primitive%2Findex.ts%3A36%2C20>

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

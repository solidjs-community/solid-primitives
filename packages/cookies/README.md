<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=cookies" alt="Solid Primitives cookies">
</p>

# @solid-primitives/cookies

[![size](https://img.shields.io/badge/size-456_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/cookies)
[![version](https://img.shields.io/npm/v/@solid-primitives/cookies?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/cookies)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Reactive, signal-based cookie primitives for isomorphic use — readable and writable on both the server and the client.

This package provides **higher-order** cookie functionality: typed reactive signals that stay in sync with `document.cookie`, with built-in SSR support via `getRequestEvent`. It is intentionally narrow in scope.

> **Looking for raw cookie read/write?** [`@solid-primitives/storage`](../storage) exposes `cookieStorage` — a `localStorage`-compatible API (`getItem`, `setItem`, `removeItem`, `key`) that works on both client and server, including full support for cookie attributes such as `domain`, `path`, `secure`, `sameSite`, and `maxAge`. Use that package when you need direct, imperative access to the cookie store.

- [`createServerCookie`](#createservercookie) - Reactive signal backed by a named cookie; isomorphic on client and server.
- [`createUserTheme`](#createusertheme) - Type-safe `"light" | "dark"` theme signal stored as a cookie.
- [`getCookiesString`](#getcookiesstring) - Returns the raw cookie string from `document.cookie` on the client or the request `Cookie` header on the server.

## Installation

```bash
npm install @solid-primitives/cookies
# or
yarn add @solid-primitives/cookies
# or
pnpm add @solid-primitives/cookies
```

## How to use it

## `createServerCookie`

Creates a reactive signal whose value is persisted to a named cookie. Reading the signal works on both the server (via the request `Cookie` header) and the client (via `document.cookie`). Writing the signal on the client automatically syncs the new value back to `document.cookie`.

```tsx repl
import { render } from "@solidjs/web";
import { createServerCookie } from "@solid-primitives/cookies";

const cookiesAvailable = (() => {
  try {
    document.cookie;
    return true;
  } catch {
    return false;
  }
})();

function Demo() {
  if (!cookiesAvailable) return <p>Cookies are blocked in this sandboxed preview.</p>;
  const [name, setName] = createServerCookie("demo_name");
  return (
    <>
      <input
        value={name() ?? ""}
        placeholder="Type a name"
        onInput={e => setName(e.currentTarget.value || undefined)}
      />
      <button onClick={() => setName(undefined)}>Clear cookie</button>
      <p>cookie value: {name() ?? "(unset)"}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createServerCookie } from "@solid-primitives/cookies";

const [cookie, setCookie] = createServerCookie("cookieName");

cookie(); // => string | undefined
setCookie("newValue");
```

### Custom serialization

Pass `deserialize` and `serialize` functions to store non-string values.

```ts
import { createServerCookie } from "@solid-primitives/cookies";

const [serverCookie, setServerCookie] = createServerCookie("coolCookie", {
  deserialize: str => (str ? str.split(" ") : []), // Deserializes cookie into a string[]
  serialize: val => (val ? val.join(" ") : ""), // Serializes the value back into a string
});

serverCookie(); // => string[]
```

## `createUserTheme`

Composes `createServerCookie` to provide a type-safe `"light" | "dark"` theme signal. Any unrecognized cookie value is treated as `undefined` (or the provided `defaultValue`).

```tsx repl
import { render } from "@solidjs/web";
import { createUserTheme } from "@solid-primitives/cookies";

const cookiesAvailable = (() => {
  try {
    document.cookie;
    return true;
  } catch {
    return false;
  }
})();

function Demo() {
  if (!cookiesAvailable) return <p>Cookies are blocked in this sandboxed preview.</p>;
  const [theme, setTheme] = createUserTheme("demo_theme", { defaultValue: "light" });
  return (
    <div
      style={{
        padding: "1rem",
        background: theme() === "dark" ? "#222" : "#fff",
        color: theme() === "dark" ? "#fff" : "#222",
      }}
    >
      <button onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}>Toggle theme</button>
      <p>theme: {theme()}</p>
    </div>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createUserTheme } from "@solid-primitives/cookies";

const [theme, setTheme] = createUserTheme("cookieName");

theme(); // => "light" | "dark" | undefined

// with default value
const [theme, setTheme] = createUserTheme("cookieName", {
  defaultValue: "light",
});

theme(); // => "light" | "dark"
```

## `getCookiesString`

Returns the raw cookie string for the current environment — `document.cookie` in the browser, or the `Cookie` request header on the server. Use it together with `parseCookie` when you need to read a cookie value outside of a reactive context.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { getCookiesString, parseCookie } from "@solid-primitives/cookies";

const read = () => {
  try {
    return getCookiesString();
  } catch {
    return null;
  }
};

function Demo() {
  const [raw, setRaw] = createSignal(read());
  const addCookie = () => {
    try {
      document.cookie = `demo_clicked=${Date.now()};max-age=3600`;
    } catch {}
    setRaw(read());
  };
  return (
    <>
      <button onClick={addCookie}>Set demo_clicked cookie</button>
      {raw() === null ? (
        <p>Cookies are blocked in this sandboxed preview.</p>
      ) : (
        <>
          <p>raw: {raw() || "(empty)"}</p>
          <p>demo_clicked: {parseCookie(raw() ?? "", "demo_clicked") ?? "(not found)"}</p>
        </>
      )}
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { getCookiesString, parseCookie } from "@solid-primitives/cookies";

const string = getCookiesString();
const cookie = parseCookie(string, "cookie_name");
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

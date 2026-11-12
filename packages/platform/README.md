<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=platform" alt="Solid Primitives platform">
</p>

# @solid-primitives/platform

[![size](https://img.shields.io/badge/size-603_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/platform)
[![version](https://img.shields.io/npm/v/@solid-primitives/platform?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/platform)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

A set of const boolean variables identifying device and browser type.

## Installation

```bash
npm install @solid-primitives/platform
# or
pnpm add @solid-primitives/platform
# or
yarn add @solid-primitives/platform
```

> **Note:** Requires Solid.js v2 (`solid-js@^2.0.0-beta.10`) and `@solidjs/web@^2.0.0-beta.10`.

## How to use it

```ts
import { isWebKit, isFirefox } from "@solid-primitives/platform";

if (!isFirefox) {
  // won't run on the Mozilla Firefox Browser
}

if (isWebKit) {
  // run WebKit Engine specific code
}
```

> **Note:** This package is tree-shakable, all unused variables will be removed from the bundle.

> **Note:** On the server, all variables will be `false`.

## List of variables

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, For } from "solid-js";
// namespace import only to list every flag; import named flags in real code
import * as platform from "@solid-primitives/platform";

function Demo() {
  const [onlyTrue, setOnlyTrue] = createSignal(false);
  const flags = () => Object.entries(platform).filter(([, value]) => !onlyTrue() || value);
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={onlyTrue()}
          onChange={e => setOnlyTrue(e.currentTarget.checked)}
        />
        only show true
      </label>
      <ul>
        <For each={flags()}>
          {([name, value]) => (
            <li>
              {name}: <strong>{String(value)}</strong>
            </li>
          )}
        </For>
      </ul>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### Device

- `isAndroid` — Is Android Device

- `isWindows` — Is Windows Device

- `isMac` — Is Mac Device

- `isIPhone` — Is IPhone Device

- `isIPad` — Is IPad Device

- `isIPod` — Is IPod Device

- `isIOS` — Is IOS Device

- `isAppleDevice` — Is Apple Device

- `isMobile` — is a Mobile Browser

### Browser

- `isFirefox` — Browser is Mozilla Firefox

- `isOpera` — Browser is Opera

- `isSafari` — Browser is Safari

- `isIE` — Browser is Internet Explorer

- `isChromium` — is Chromium-based browser

- `isEdge` — Browser is Edge

- `isChrome` — Browser is Chrome

- `isBrave` — Browser is Brave

### Rendering Engine

- `isGecko` — Browser using Gecko Rendering Engine

- `isBlink` — Browser using Blink Rendering Engine

- `isWebKit` — Browser using WebKit Rendering Engine

- `isPresto` — Browser using Presto Rendering Engine

- `isTrident` — Browser using Trident Rendering Engine

- `isEdgeHTML` — Browser using EdgeHTML Rendering Engine

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

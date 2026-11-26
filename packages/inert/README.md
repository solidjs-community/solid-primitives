<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=inert&version=2.0" alt="Solid Primitives inert">
</p>

# @solid-primitives/inert

[![docs](https://img.shields.io/badge/-docs-blue?style=for-the-badge)](https://primitives.solidjs.community/package/inert)
[![version](https://img.shields.io/npm/v/@solid-primitives/inert?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/inert)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Hide everything outside a modal layer from assistive technology and user interaction by marking it `aria-hidden` and/or `inert`.

- [`makeInertOthers`](#makeinertothers) - non-reactive, returns a cleanup function.
- [`createInertOthers`](#createinertothers) - reactive and owner-aware, toggled by a signal.

Both walk from the target element(s) up to the root and hide every sibling subtree that does not contain a target. Previous attribute values are restored on cleanup, stacked layers are ref-counted per node, and a `MutationObserver` covers nodes added later. On the server both are no-ops.

## Installation

```bash
npm install @solid-primitives/inert
# or
yarn add @solid-primitives/inert
# or
pnpm add @solid-primitives/inert
```

## `makeInertOthers`

```ts
// Type
type InertStrategy = "aria-hidden" | "inert" | "both";

type InertOthersOptions = {
  strategy?: InertStrategy; // default "aria-hidden"
  ignore?: Element | readonly (Element | null | undefined)[] | null;
  root?: Element; // default: the target's document.body
};

function makeInertOthers(
  targets: HTMLElement | readonly HTMLElement[] | null | undefined,
  options?: InertOthersOptions,
): VoidFunction;

// Example
import { makeInertOthers } from "@solid-primitives/inert";

const restore = makeInertOthers(dialogEl, { strategy: "both", ignore: toastRegionEl });
// ...when the dialog closes
restore();
```

## `createInertOthers`

```ts
// Type
function createInertOthers(
  targets: MaybeAccessor<HTMLElement | readonly HTMLElement[] | null | undefined>,
  enabled?: MaybeAccessor<boolean>, // default true
  options?: Omit<InertOthersOptions, "ignore"> & { ignore?: MaybeAccessor<...> },
): void;

// Example
import { createSignal } from "solid-js";
import { createInertOthers } from "@solid-primitives/inert";

const [dialog, setDialog] = createSignal<HTMLElement>();
const [open, setOpen] = createSignal(false);

createInertOthers(dialog, open);

<div ref={setDialog} role="dialog" />;
```

The layer is applied after render, so a ref signal works as `targets`. Changing `targets`, `enabled` or `ignore` restores the DOM and re-applies it. Disposal of the owner restores it too.

## Behavior

- **Skipped nodes:** `ignore` elements, live regions (`aria-live` other than `off`, and `role` `alert` / `status` / `log`; only with the default `aria-hidden` strategy, and never a live region that contains a lower layer's target), `script` / `style` / `template` / `noscript` / `link` / `meta`, and nodes that were already `aria-hidden="true"` (or `inert`) before the layer opened. A branch that contains a protected element stays exposed and its other children are hidden.
- **Restore:** a node's previous `aria-hidden` / `inert` value (or absence) is put back when its last holder closes.
- **Stacking:** opening a second layer hides the first one and exposes the second. Each node keeps a shared per-strategy ref count, so the layers can close in any order and a node stays hidden until every layer that hides it is closed.
- **Dynamic content:** nodes appended to a walked parent are hidden, and nodes removed from the document are released.
- **Notes:** `inert` is not supported in every older browser, use `"both"` for the widest coverage. Attributes set by other code on a node while a layer holds it are overwritten on restore.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=template-primitive" alt="Solid Primitives template-primitive">
</p>

# @solid-primitives/template-primitive

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/template-primitive?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/template-primitive)
[![version](https://img.shields.io/npm/v/@solid-primitives/template-primitive?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/template-primitive)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A sample primitive that is made up for templating with the following options:

`createPrimitiveTemplate` - Provides a getter and setter for the primitive.

## Installation

```bash
npm install @solid-primitives/template-primitive
# or
yarn add @solid-primitives/template-primitive
# or
pnpm add @solid-primitives/template-primitive
```

## How to use it

```ts
const [value, setValue] = createPrimitiveTemplate(false);
```

## Demo

You can use this template for publishing your demo on CodeSandbox: https://codesandbox.io/s/solid-primitives-demo-template-sz95h

## Stories

Stories live in `stories/` and are served by the root Storybook instance (`pnpm storybook`).

**Minimal setup** — every package that has stories needs:

```
stories/
  tsconfig.json          ← required (see below)
  [primitive].stories.tsx
```

`stories/tsconfig.json`:
```json
{
  "extends": "../../../.storybook/tsconfig.json",
  "include": ["./**/*"]
}
```

**Writing stories** — see `stories/index.stories.tsx` in this template for a fully annotated example. Key points:

- `title` follows `"Category/PackageName"` — match the `primitive.category` field in `package.json`.
- Only one file per package should have `tags: ["autodocs"]` and `docs.description.component: readme`. That file becomes the Docs landing page.
- When a package has several primitives, create one `*.stories.tsx` file per primitive, all sharing the same `title`. Prefix shared UI helpers with `_` (e.g. `_helpers.tsx`) so Storybook ignores them.
- Static assets (audio, images, etc.) go in `stories/assets/` and must be registered in `.storybook/main.ts` under `staticDirs`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

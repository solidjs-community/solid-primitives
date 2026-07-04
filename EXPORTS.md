# Package Exports & the `@solid-primitives/source` Condition

Every package in this monorepo ships the following `exports` block in its `package.json`:

```json
"exports": {
  "import": {
    "@solid-primitives/source": "./src/index.ts",
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  }
}
```

## Why a custom export condition?

By default, Node.js and TypeScript only recognise a fixed set of export conditions (`import`, `require`, `browser`, `types`, etc.). A **custom condition** is an arbitrary string that tools opt in to — it is silently ignored by anything that doesn't explicitly request it.

We use `@solid-primitives/source` to expose the raw TypeScript source file (`./src/index.ts`) alongside the compiled artefacts. When this condition is active, the resolver returns the `.ts` file instead of the `.js`/`.d.ts` pair, so cross-package imports inside the repo work _without a build step_: edit a file in `packages/utils`, and every other package that imports it sees the change instantly.

The technique is explained in detail in Colin McDonnell's article [**Live types in a TypeScript monorepo**](https://colinhacks.com/essays/live-types-typescript-monorepo).

## Where the condition is activated

### TypeScript — `tsconfig.json`

The root `tsconfig.json` sets:

```json
"customConditions": ["@solid-primitives/source"]
```

This tells the TypeScript language server and `tsc` to prefer `.ts` source when resolving workspace package imports — so IDE go-to-definition and type checking always reflect the live source, not a stale build.

### Tests — `configs/vitest.config.ts`

The shared Vitest config passes the condition to Vite's resolver:

```ts
conditions: ["@solid-primitives/source", "browser", "development"]
// or for SSR:
conditions: ["@solid-primitives/source", "node"]
```

This means tests import raw TypeScript directly and never need the `dist/` folder to be current.

### The Solid Playground / other tools

Any tool that adds `@solid-primitives/source` to its resolution conditions (e.g. a Vite-based playground) will likewise bypass the build output and work from source.

## What external consumers see

Consumers who install a package from npm — or who do not activate the custom condition — land on the normal compiled path:

```
types  → ./dist/index.d.ts
default → ./dist/index.js
```

The `src/` files are included in the published package anyway (they serve as source maps), but external tooling never resolves to them unless it explicitly opts in.

## Adding the condition to a new package

Copy the `exports` block above into the new package's `package.json`. No other changes are needed — the root `tsconfig.json` and shared Vitest config already activate the condition repo-wide.

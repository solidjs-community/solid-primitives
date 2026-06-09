<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=spring" alt="Solid Primitives spring">
</p>

# @solid-primitives/spring

[![size](https://img.shields.io/badge/size-753_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/spring)
[![version](https://img.shields.io/npm/v/@solid-primitives/spring?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/spring)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Animate signal values with spring physics. Instead of jumping to the next value instantly, the animated signal "bounces" toward it — producing natural, physically-based motion for numbers, Dates, arrays, and nested objects.

Inspired by and directly ported from [`svelte/motion`](https://svelte.dev/docs/svelte-motion#spring).

- `createSpring` — returns a `[value, set]` pair. Call `set(target)` to drive the animation; read `value()` reactively.
- `createDerivedSpring` — read-only variant that follows an existing accessor automatically.

## Physics options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stiffness` | `number` | `0.15` | How tightly the spring pulls toward the target. Higher = snappier. |
| `damping` | `number` | `0.8` | How quickly oscillation decays. Lower = more bouncy. `0` = infinite oscillation. |
| `precision` | `number` | `0.01` | Displacement threshold below which the spring is considered settled. |

## Installation

```bash
npm install @solid-primitives/spring
# or
yarn add @solid-primitives/spring
# or
pnpm add @solid-primitives/spring
```

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14`.

## How to use it

### `createSpring`

```ts
import { createSpring } from "@solid-primitives/spring";

// Animate a number
const [progress, setProgress] = createSpring(0);
setProgress(100); // animates 0 → 100

// Tune the physics
const [value, setValue] = createSpring(0, { stiffness: 0.05, damping: 0.6 });

// Animate an object — every key is interpolated independently
const [xy, setXY] = createSpring({ x: 0, y: 0 }, { stiffness: 0.08, damping: 0.2 });
setXY({ x: 200, y: 150 });

// Animate an array
const [rgb, setRgb] = createSpring([255, 0, 0]);
setRgb([0, 128, 255]);

// Animate a Date
const [date, setDate] = createSpring(new Date("2024-01-01"));
setDate(new Date("2025-12-31"));
```

### Setter options

```ts
// Snap immediately — no animation, Promise resolves right away
setProgress(100, { hard: true });

// Functional setter — receives the current animated value
setProgress(prev => prev + 10);

// Await settlement before doing something else
await setProgress(100);
console.log("animation finished");
```

#### `soft` — gradual launch

Pass `soft: true` (or a duration in seconds) to start the animation with temporarily
reduced stiffness. The spring "eases in" before regaining full force, preventing a
jarring kick when interrupting an ongoing animation.

```ts
setProgress(100, { soft: true });      // ~0.5 s soft window
setProgress(100, { soft: 0.3 });       // 0.3 s soft window
```

### `createDerivedSpring`

Follows an existing accessor automatically — no need to wire up an effect manually.

```ts
import { createSignal } from "solid-js";
import { createDerivedSpring } from "@solid-primitives/spring";

const [count, setCount] = createSignal(0);
const springCount = createDerivedSpring(count, { stiffness: 0.05 });

// springCount() lags behind count() with spring physics
return <p>{springCount().toFixed(1)}</p>;
```

Works with any accessor, including `createMemo`:

```ts
const percent = createMemo(() => (completed() / total()) * 100);
const springPercent = createDerivedSpring(percent);
```

### SSR

Both primitives are SSR-safe. On the server:

- `createSpring` returns the initial value unchanged. The setter resolves immediately for `hard: true`; otherwise it returns a Promise that never resolves (no animation runs).
- `createDerivedSpring` returns the initial accessor value unchanged.

## Demo

- **[Playground](https://primitives.solidjs.community/playground/spring)** — [source code](https://github.com/solidjs-community/solid-primitives/blob/main/packages/spring/dev/index.tsx)
- **[CodeSandbox — Basic Example](https://codesandbox.io/p/devbox/ecstatic-borg-k2wqfr)**

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

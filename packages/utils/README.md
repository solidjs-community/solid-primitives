<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Utils" alt="Solid Primitives Utils">
</p>

# @solid-primitives/utils

[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Solid Primitives Utilities is a support and helper package for a number of primitives in our library. Please free to augment or centralize useful utilities and methods in this package for sharing.

## Installation

```bash
npm install @solid-primitives/utils
# or
pnpm add @solid-primitives/utils
# or
yarn add @solid-primitives/utils
```

## Immutable helpers

Functional programming helpers for making non-mutating changes to data. Keeping it immutable. Useful for updating signals.

```ts
import { pick } from "@solid-primitives/utils/immutable";

const original = { foo: 123, bar: "baz" };
const newObj = pick(original, "foo");
original; // { foo: 123, bar: "baz" }
newObj; // { foo: 123 }
```

Use it for changing signals:

```ts
import { push, update } from "@solid-primitives/utils/immutable";

const [list, setList] = createSignal([1, 2, 3]);
setList(p => push(p, 4));

const [user, setUser] = createSignal({
  name: "John",
  street: { name: "Kingston Cei", number: 24 },
});
setUser(p => update(p, "street", "number", 64));
```

## List of functions:

### Copying

- **`shallowArrayCopy`** - make shallow copy of an array
- **`shallowObjectCopy`** - make shallow copy of an object
- **`shallowCopy`** - make shallow copy of an array/object
- **`withArrayCopy`** - apply mutations to the an array without changing the original
- **`withObjectCopy`** - apply mutations to the an object without changing the original
- **`withCopy`** - apply mutations to the an object/array without changing the original

### Array

- **`push`** - non-mutating `Array.prototype.push()`
- **`drop`** - non-mutating function that drops n items from the array start
- **`dropRight`** - non-mutating function that drops n items from the array end
- **`filterOut`** - standalone `Array.prototype.filter()` that filters out passed item
- **`filter`** - standalone `Array.prototype.filter()`
- **`sort`** - non-mutating `Array.prototype.sort()` as a standalone function
- **`sortBy`** - Sort an array by object key, or multiple keys
- **`map`** - standalone `Array.prototype.map()` function
- **`slice`** - standalone `Array.prototype.slice()` function
- **`splice`** - non-mutating `Array.prototype.splice()` as a standalone function
- **`fill`** - non-mutating `Array.prototype.fill()` as a standalone function
- **`concat`** - Creates a new array concatenating array with any additional arrays and/or values.
- **`remove`** - Remove item from array
- **`removeItems`** - Remove multiple items from an array
- **`flatten`** - Flattens a nested array into a one-level array
- **`filterInstance`** - Flattens a nested array into a one-level array
- **`filterOutInstance`** - Flattens a nested array into a one-level array

### Object

- **`omit`** - Create a new subset object without the provided keys
- **`pick`** - Create a new subset object with only the provided keys
- **`split`** - Split object into multiple subset objects.
- **`merge`** - Merges multiple objects into a single one.

### Object/Array

- **`get`** - Get a single property value of an object by specifying a path to it.
- **`update`** - Change single value in an object by key, or series of recursing keys.

### Number

- **`add`** - `a + b + c + ...` _(works for numbers or strings)_
- **`substract`** - `a - b - c - ...`
- **`multiply`** - `a * b * c * ...`
- **`divide`** - `a / b / c / ...`
- **`power`** - `a ** b ** c ** ...`
- **`clamp`** - clamp a number value between two other values

## String transforms

`(string) => T` transform functions for converting raw string data into typed values. Useful as the `transform` option for SSE, WebSocket, and similar streaming primitives.

```ts
import { json, ndjson, safe } from "@solid-primitives/utils";

const { data } = createSSE<Event>(url, { transform: json });
const { data } = createSSE<Event[]>(url, { transform: ndjson });
const { data } = createSSE<Event>(url, { transform: safe(json) });
```

- **`json`** - Parse a string as a single JSON value
- **`ndjson`** - Parse newline-delimited JSON (NDJSON / JSON Lines) into an array
- **`lines`** - Split a string into a `string[]` by newline, filtering empty lines
- **`number`** - Parse a string as a number via `Number()`
- **`safe(transform, fallback?)`** - Wrap any transform in a `try/catch`; returns `fallback` instead of throwing
- **`pipe(a, b)`** - Compose two transforms into one

## wrapSetter

It is a typical use case to react on setting a new value; this is especially cumbersome for stores, where you otherwise need the `deep` package to make effects subscribe to all changes. A more performant and simple approach is to wrap the setter of your signal or store. To simplify this approach, we provide a `wrapSetter` function:

```ts
import { createStore } from "solid-js";
import { wrapSetter } from "@solid-primitives/utils";

const [state, setState] = wrapSetter(
  createStore(
    localStorage.getItem("persistedState")
      ? JSON.parse(localStorage.getItem("persistedState"))
      : initialState,
  ),
  setter => next => {
    const output = setState(next);
    localStorage.setItem(
      "persistedState",
      latest(() => JSON.stringify(state)),
    );
    return output;
  },
);
```

If the signal or store is destructured into a tuple and augmented with additional values, those are left intact in the output. For the TS types to work, you need to `as const` the new tuple:

```ts
import { createSignal } from "solid-js";
import { wrapSetter } from "@solid-primitives/utils";

const augmentedSignal = [...createSignal(0), { extra: "data" }] as const;
const [count, setCount, data] = wrapSetter(
  augmented,
  setter => next => (console.log(next), setter(next)),
);
```

## Color utilities

Multi-format color parsing, conversion, and accessibility naming — available as a separate subpath so you only pay for what you use.

> **Credits** — The core color types, parsing, and color-space conversion logic (`types.ts`, `helpers.ts`, `intl.ts`) are adapted from [Kobalte](https://github.com/kobaltedev/kobalte) (MIT, Copyright Fabien Marie-Louise), which itself credits the [React Spectrum](https://github.com/adobe/react-spectrum) team (Apache 2.0, Copyright 2020 Adobe). The OKLCH inverse pipeline in `manipulation.ts` uses coefficients from [Björn Ottosson's OKLab](https://bottosson.github.io/posts/oklab/) work.

```ts
import {
  parseColor,
  normalizeColor,
  getColorChannels,
  normalizeHue,
} from "@solid-primitives/utils/colors";
import { COLOR_INTL_TRANSLATIONS } from "@solid-primitives/utils/colors";
```

### Parsing & conversion

```ts
const color = parseColor("#3264C8");

color.toString(); // "rgb(50, 100, 200)"  (css default)
color.toString("hsl"); // "hsl(220 60% 49.02%)"
color.toString("hsb"); // "hsb(220 75% 78.43%)"
color.toString("hex"); // "#3264C8"
color.toString("hexa"); // "#3264C8FF"

// Convert to another space and inspect channels
const hsl = color.toFormat("hsl");
hsl.getChannelValue("hue"); // 220
hsl.getChannelValue("saturation"); // 60
hsl.getChannelValue("lightness"); // 49.02

// Derive a new color by changing one channel
const lighter = hsl.withChannelValue("lightness", 70);
lighter.toString("hex"); // "#6699E8"
```

Accepted input formats:

| Format | Examples                                                                                   |
| ------ | ------------------------------------------------------------------------------------------ |
| Hex    | `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`                                                    |
| RGB    | `rgb(50 100 200)`, `rgb(50, 100, 200)`, `rgb(50 100 200 / 0.5)`, `rgba(50, 100, 200, 0.5)` |
| HSL    | `hsl(220, 60%, 49%)`, `hsla(220, 60%, 49%, 0.5)`                                           |
| HSB    | `hsb(220, 75%, 78%)`, `hsba(220, 75%, 78%, 0.5)`                                           |

`parseColor` throws for unrecognised strings. Use `normalizeColor` when your input may already be a `Color` object:

```ts
function accept(value: string | Color) {
  const color = normalizeColor(value); // no-op if already a Color
}
```

### Channel metadata

```ts
// Ordered channel names for a space
getColorChannels("rgb"); // ["red", "green", "blue"]
getColorChannels("hsl"); // ["hue", "saturation", "lightness"]
getColorChannels("hsb"); // ["hue", "saturation", "brightness"]

// Range info for driving sliders
color.getChannelRange("red"); // { minValue: 0, maxValue: 255, step: 1, pageSize: 17 }
color.getChannelRange("alpha"); // { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 }

// Intl format options for display
color.getChannelFormatOptions("hue"); // { style: "unit", unit: "degree", unitDisplay: "narrow" }

// Locale-aware formatted value
color.toFormat("hsl").formatChannelValue("saturation"); // "60%"

// Axis layout for a 2D color area picker
color.getColorSpaceAxes({ xChannel: "saturation", yChannel: "brightness" });
// { xChannel: "saturation", yChannel: "brightness", zChannel: "hue" }
```

### Hue normalization

```ts
normalizeHue(370); // 10
normalizeHue(-10); // 350
normalizeHue(360); // 360 — kept distinct from 0 for full-circle sliders
```

### Accessible color naming

`getColorName` converts to [OKLCH](https://www.w3.org/TR/css-color-4/#the-oklch-notation) — a perceptually uniform space — and produces a human-readable description suitable for `aria-label` and similar attributes. Pass `COLOR_INTL_TRANSLATIONS` for English or supply your own translations object.

```ts
import { parseColor, COLOR_INTL_TRANSLATIONS } from "@solid-primitives/utils/colors";

const t = COLOR_INTL_TRANSLATIONS;

parseColor("#3264C8").getColorName(t); // "dark vibrant blue"
parseColor("hsl(48 80% 55%)").getColorName(t); // "orange"
parseColor("rgb(50 100 200 / 0.2)").getColorName(t); // "dark vibrant blue, 80% transparent"

parseColor("#3264C8").getHueName(t); // "blue"
parseColor("#c86432").getHueName(t); // "brown"

// Channel label for a slider aria-label
parseColor("#fff").getChannelName("saturation", t); // "Saturation"
```

Providing translations for other locales:

```ts
import type { ColorIntlTranslations } from "@solid-primitives/utils/colors";

const frTranslations: ColorIntlTranslations = {
  ...COLOR_INTL_TRANSLATIONS,
  hue: "Teinte",
  saturation: "Saturation",
  lightness: "Luminosité",
  blue: "bleu",
  // ...
};
```

### Safe parsing

```ts
tryParseColor("#3264C8"); // Color
tryParseColor("nope"); // undefined — never throws

isValidColor("#3264C8"); // true
isValidColor("nope"); // false

detectColorFormat("rgb(50, 100, 200)"); // "rgb"
detectColorFormat("#3264C8FF"); // "hexa"
detectColorFormat("hsla(220, 60%, 49%, 0.5)"); // "hsla"
detectColorFormat("nope"); // undefined
```

### Manipulation

All manipulation functions return a new `Color`; the input is never mutated. `amount` is a 0–1 ratio representing percentage points on the relevant HSL channel (e.g. `0.1` = 10 pp).

```ts
import {
  lighten,
  darken,
  saturate,
  desaturate,
  complement,
  mix,
} from "@solid-primitives/utils/colors";

lighten(color, 0.1); // +10 lightness (HSL)
darken(color, 0.1); // −10 lightness (HSL)
saturate(color, 0.2); // +20 saturation (HSL)
desaturate(color, 0.2); // −20 saturation (HSL)
complement(color); // hue + 180° (HSL)

mix(black, white); // 50/50 blend in RGB
mix(black, white, 0.25); // 25% toward white
```

### Accessibility (WCAG 2.1)

```ts
import { contrastRatio, isReadable } from "@solid-primitives/utils/colors";

contrastRatio(parseColor("#000"), parseColor("#fff")); // 21
contrastRatio(parseColor("#3264C8"), parseColor("#fff")); // ~3.9

// AA / AAA, normal / large text
isReadable(fg, bg); // AA normal  (≥ 4.5 : 1)
isReadable(fg, bg, "AA", "large"); // AA large   (≥ 3.0 : 1)
isReadable(fg, bg, "AAA"); // AAA normal (≥ 7.0 : 1)
isReadable(fg, bg, "AAA", "large"); // AAA large  (≥ 4.5 : 1)
```

### Color scales

```ts
import { colorScale, perceptualColorScale } from "@solid-primitives/utils/colors";

// 5-step RGB gradient from black to white
colorScale(parseColor("#000"), parseColor("#fff"), 5);
// [#000000, #404040, #808080, #BFBFBF, #FFFFFF]

// 5-step perceptual gradient (OKLCH space, shortest hue arc)
// Red → Blue goes through purple, not green
perceptualColorScale(parseColor("hsl(0, 80%, 50%)"), parseColor("hsl(240, 80%, 50%)"), 5);
```

### List of exports

**Parsing**

- **`parseColor(value)`** - Parse a color string; throws on invalid input
- **`normalizeColor(value)`** - Accept a string or `Color`, always return a `Color`
- **`tryParseColor(value)`** - Like `parseColor` but returns `undefined` instead of throwing
- **`isValidColor(value)`** - Boolean check without parsing overhead
- **`detectColorFormat(value)`** - Detect the syntax format of a color string

**Color space / channels**

- **`getColorChannels(space)`** - Ordered channel triple for a color space
- **`normalizeHue(hue)`** - Wrap a hue angle to `[0, 360]`
- **`colorToOKLCH(color)`** - Convert any `Color` to `[L, C, H]` in OKLCH space

**Manipulation**

- **`lighten(color, amount)`** / **`darken(color, amount)`** - Adjust HSL lightness
- **`saturate(color, amount)`** / **`desaturate(color, amount)`** - Adjust HSL saturation
- **`complement(color)`** - Hue + 180°
- **`mix(a, b, ratio?)`** - Blend two colors in RGB space

**Accessibility**

- **`contrastRatio(a, b)`** - WCAG 2.1 contrast ratio (1–21)
- **`isReadable(fg, bg, level?, size?)`** - WCAG 2.1 AA / AAA compliance check

**Color scales**

- **`colorScale(from, to, steps)`** - Linear RGB gradient
- **`perceptualColorScale(from, to, steps)`** - Perceptually uniform OKLCH gradient

**i18n / naming**

- **`COLOR_INTL_TRANSLATIONS`** - Default English translations
- **`ColorIntlTranslations`** _(type)_ - Shape of a translations object

**Types**

- **`Color`** _(interface)_ - The immutable color value type
- **`ColorFormat`** _(type)_ - `"hex" | "hexa" | "rgb" | "rgba" | "hsl" | "hsla" | "hsb" | "hsba"`
- **`ColorSpace`** _(type)_ - `"rgb" | "hsl" | "hsb"`
- **`ColorChannel`** _(type)_ - `"hue" | "saturation" | "brightness" | "lightness" | "red" | "green" | "blue" | "alpha"`
- **`ColorAxes`** _(type)_ - `{ xChannel, yChannel, zChannel: ColorChannel }`
- **`ColorChannelRange`** _(type)_ - `{ minValue, maxValue, step, pageSize }`

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

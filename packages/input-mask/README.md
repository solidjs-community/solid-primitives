<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Input%20Mask" alt="Solid Primitives">
</p>

# @solid-primitives/input-mask

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/input-mask?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/input-mask)
[![version](https://img.shields.io/npm/v/@solid-primitives/input-mask?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/input-mask)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive that returns an event handler to mask the inputs of an text input element (`<input>`, `<textarea>`) when applied in `oninput` or `onchange`.

## Installation

```bash
npm install @solid-primitives/input-mask
# or
yarn add @solid-primitives/input-mask
```

## Usage

For convenience reasons, the handler returns the current value, which allows you to use it to fill a signal or assign a let variable. The masks come in 3 different formats: function, array and string. There are tools to convert string masks to array masks and array masks to function masks.

```ts
import {
  stringMaskToArray,
  arrayMaskToFn,
  anyMaskToFn,
  createInputMask
} from "@solid-primitives/input-mask";
// string mask:
// 9 = any number,
// a = any letter,
// * = any alphanumeric character
// any other letter becomes a fixed placeholder
const isodate = "9999-99-99";
// array mask: RegExp to match variable parts, strings for fixed placeholders
const meetingId = [/\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/];
// function mask: (value, [start, end]) => [value, [start, end]]
const meetingIdOrName = (value, selection) =>
  (/^\D/.test(value) ? arrayMaskToFn([/\w+/, /\S*/]) : anyMaskToFn("999-999-999"))(
    value,
    selection
  );

// converting string mask to array:
const maskArrayFromString = stringMaskToArray(maskString);
const maskFuncFromArray = arrayMaskToFn(maskArray);
const maskFuncFromStringOrArray = anyMaskToFn(mask);

// use let variable, store, mutable or signal to get value in event:
let changeMaskValue = "";
// use ref to get the value:
let inputMaskRef;
const inputMask = {
  ref,
  get value() {
    return inputMask.ref?.value;
  }
};

const dateMask = createInputMask("99/99/9999");

return (
  <>
    <label for="changeMask">The mask will only be applied after you leave the field</label>
    <input
      type="text"
      id="changeMask"
      onchange={e => {
        changeMaskValue = dateMask(e);
      }}
    />
    <label for="inputMask">The mask will be applied on every single input</label>
    <input type="text" id="inputMask" ref={inputMask.ref} oninput={dateMask} />
  </>
);
```

In most cases you'll want to use `oninput`.

## FAQ

- **Why not support contenteditable?**<br> Getting accessible cross-browser support for contenteditable elements is difficult and results in bloated code, so it was decided to skip it for now. If there is enough demand, a later version might introduce it. You could use the exposed mask compilation to roll your own; if you do, please share it with us.
- **Why `oninput`/`onchange` instead of e.g. `onkeyup`?**<br> There are a few things happening after keydown, -press and -up, which would result in flickering. Generally, you could use `onblur`, but then you'd attempt to apply the mask even if nothing changed, which just seems unnecessarily wasteful.
- **Will it work with actual events?**<br> Yes, it will work with composed as well as native events. Solid's composed events are more performant, though.
- **Is there a server version?**<br> No, since it only creates an event handler that will solely run on the client; it makes no sense to create a server version.
- **Does this provide any error handling?**<br> There is no error handling, but it should work well together with any form handling library.
- **Can I turn this off and on again?**<br> You can still wrap the output handler in your own handler to turn it off and on again:

```jsx
import { createInputMask } from "@solid-primitives/input-mask";

let ref;
let useMask = false;
const mask = createInputMask("9999-99-99");
return <input ref={ref} oninput={e => useMask && mask(e)} />;
```

### DEMO

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>

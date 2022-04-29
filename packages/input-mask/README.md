<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Input%20Mask" alt="Solid Primitives Input Mask">
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

For convenience reasons, the handler returns the current value, which allows you to use it to fill a signal or assign a let variable. The masks come in 4 different formats: function, regex-replacer, array and string. There are tools to convert string masks to array masks and regex-replacer and array masks to function masks.

```ts
import {
  stringMaskToArray,
  regexMaskToFn,
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
const meetingId = [/\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/]);
// regex replacer mask: a RegExp to match parts and a function to replace them
const meetingName = [/[^0-9a-zäöüß\-_/]|^(https?:\/\/|)(meet\.goto\.com|gotomeet\.me|)\/?/gi, () => ''];
// function mask: (value, [start, end]) => [value, [start, end]]
const meetingIdOrName = (value, selection) =>
  (/^\d{1,3}$|^\d{2,4}-?\d{0,3}$|^\d{2,4}-?\d{2,4}-?\d{0,3}$/.test(value)
    ? anyMaskToFn(meetingId)
    : anyMaskToFn(meetingName)
  )(value, selection);

// converting string mask to array:
const maskArrayFromString = stringMaskToArray(maskString);
// converting other formats to function:
const maskFuncFromArray = arrayMaskToFn(maskArray);
const maskFuncFromRegexReplacer = regexMaskToFn(regexMask, replacerFn);
const maskFuncFromAny = anyMaskToFn(mask);

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
    <input type="text" id="inputMask" ref={inputMask.ref} oninput={dateMask} onPaste={dateMask} />
  </>
);
```

In most cases you'll want to use `onInput` and `onPaste`.

## FAQ

- **Why not support contenteditable?**<br> In most cases, you ain't gonna need it and a lower bundle size is always good. In those rare cases you do need it, check the [selection](../selection/README.md) package, it shows you how to employ the mask filter functions together with a selection that supports contenteditable.
- **Why `oninput`/`onchange` instead of e.g. `onkeyup`?**<br> There are a few things happening after keydown, -press and -up, which would result in flickering. Generally, you could use `onblur`, but then you'd attempt to apply the mask even if nothing changed, which just seems unnecessarily wasteful.
- **Will it work with actual events?**<br> Yes, it will work with composed as well as native events, even with React's synthetic events; `createInputMask` has an optional generic that you can use to type the output events. Solid's composed events are more performant than DOM events, so it is best practice to use them.
- **Is there a server version?**<br> No, since it only creates an event handler that will solely run on the client; it makes no sense to create a server version.
- **Does this provide any error handling?**<br> There is no error handling, but it should work well together with any form handling library.
- **Can I limit the events this uses?**<br> If you want to limit the events this uses e.g. as part of a library or to use this with another framework's events while you port your app to solid, we got you covered, you can just call `createInputMask<EventTypeUnion>(mask)` in order to do exactly that.
- **Can I change the string mask handling?**<br> As a matter of fact, you can! Either use the second optional parameter of `stringMaskToArray(mask[, regexps])` or `anyMaskToFn(mask[, regexps])` or `import { stringMaskRegExp } from "@solid-primitives/input-mask"` and change it to your liking.
- **Can I turn this off and on again?**<br> You can still wrap the output handler in your own handler to turn it off and on again:

```jsx
import { createInputMask } from "@solid-primitives/input-mask";

let ref;
let useMask = false;
const mask = createInputMask("9999-99-99");
return <input ref={ref} onInput={e => useMask && mask(e)} onPaste={e => useMask && mask(e)} />;
```

### DEMO

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

0.0.101

Document onPaste event.

0.1.1

Expose string replacements.

Optional generic to type events.

0.1.2

New regexMaskToFn helper.

</details>

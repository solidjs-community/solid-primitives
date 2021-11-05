# @solid-primitives/event-listener

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

A helpful event listener primitive that binds window and any element supplied.

`createEventListener` - Very basic and straightforward primitive that handles multiple elements according to a single event binding.

## How to use it

```ts
const [add, remove] = createEventListener(document.getElementById("mybutton"), "mouseDown", () =>
  console.log("Click")
);
// or as a directive
<MyButton use:createEventListener={() => ["click", () => console.log("Click")]}>Click!</MyButton>;
// you can provide your own event map type:
createEventListener<{ myCustomEvent: Event }>(window, "myCustomEvent", () => console.log("yup!"));
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-event-listener-8mm77

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First ported commit from react-use-event-listener.

1.1.4

Released a version with type mostly cleaned up.

1.2.3

Switched to a more idiomatic pattern: Warning: incompatible with the previous version!

</details>

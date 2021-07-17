# @solid-primitives/event-listener

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

A helpful event listener primitive that binds window and any element supplied.

`createEventListener` - Very basic and straightforward primitive that handles multiple elements according to a single event binding.

## How to use it

 ```ts
const [listener] = createEventListener("mouseDown", () => console.log("Click"), document.getElementById("mybutton"))
<button use:listener>Click me</button>
 ```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-event-listener-8mm77

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First ported commit from react-use-event-listener.

</details>

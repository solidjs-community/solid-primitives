# @solid-primitives/event-props

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/event-props?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/event-props)
[![size](https://img.shields.io/npm/v/@solid-primitives/event-props?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/event-props)

A helpful primitive that creates the event props and a reactive store with the latest events

## Installation

```bash
npm install @solid-primitives/event-props
# or
yarn add @solid-primitives/event-props
```

## How to use it

### createEventProps

Receive the event props and a props with the latest events:

```ts
const [events, eventProps] = createEventProps('mousedown', 'mousemove', 'mouseup');

const isMouseDown = createMemo(() => (events.mousedown?.ts ?? 0) > (events.mouseup?.ts ?? 1));

createEffect(() => {
  if (isMouseDown) {
    console.log(events.mousemove?.clientX, events.mousemove?.clientY);
  }
})

<div {...eventProps}>Click and drag on me</div>
```


## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First commit.

</details>

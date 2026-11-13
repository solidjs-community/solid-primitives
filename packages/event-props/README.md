<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Event%20Props" alt="Solid Primitives Event Props">
</p>

# @solid-primitives/event-props

[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

[![size](https://img.shields.io/badge/size-172_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/event-props)
[![size](https://img.shields.io/npm/v/@solid-primitives/event-props?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/event-props)

A helpful primitive that creates the event props and a reactive store with the latest events

## Installation

```bash
npm install @solid-primitives/event-props
# or
yarn add @solid-primitives/event-props
# or
pnpm add @solid-primitives/event-props
```

## How to use it

### createEventProps

Receive the event props and a props with the latest events:

```tsx repl
import { render } from "@solidjs/web";
import { createMemo } from "solid-js";
import { createEventProps } from "@solid-primitives/event-props";

function Demo() {
  const [events, eventProps] = createEventProps("mousedown", "mousemove", "mouseup");
  const isMouseDown = createMemo(
    () => (events.mousedown?.timeStamp ?? 0) > (events.mouseup?.timeStamp ?? 0),
  );
  return (
    <>
      <div
        onMouseDown={eventProps.onmousedown}
        onMouseMove={eventProps.onmousemove}
        onMouseUp={eventProps.onmouseup}
        style={{ padding: "40px", border: "1px solid gray" }}
      >
        Press and move over me
      </div>
      <p>mouse down: {isMouseDown() ? "yes" : "no"}</p>
      <p>
        last drag:{" "}
        {isMouseDown()
          ? `${events.mousemove?.offsetX ?? "-"}, ${events.mousemove?.offsetY ?? "-"}`
          : "-"}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const [events, eventProps] = createEventProps('mousedown', 'mousemove', 'mouseup');

const isMouseDown = createMemo(() => (events.mousedown?.ts ?? 0) > (events.mouseup?.ts ?? 1));

createEffect(
  () => isMouseDown() && events.mousemove,
  mousemove => {
    if (mousemove) {
      console.log(mousemove.clientX, mousemove.clientY);
    }
  },
);

<div {...eventProps}>Click and drag on me</div>
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

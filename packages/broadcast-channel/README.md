<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=broadcast-channel" alt="Solid Primitives broadcast-channel">
</p>

# @solid-primitives/broadcast-channel

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/broadcast-channel?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/broadcast-channel)
[![version](https://img.shields.io/npm/v/@solid-primitives/broadcast-channel?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/broadcast-channel)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive to manage [Broadcast Channel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API). The Broadcast Channel is a browser API that allows basic communication between [browsing contexts](https://developer.mozilla.org/en-US/docs/Glossary/Browsing_context) (that is, windows, tabs, frames, or iframes) on the same [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin).

## Installation

```bash
npm install @solid-primitives/broadcast-channel
# or
yarn add @solid-primitives/broadcast-channel
# or
pnpm add @solid-primitives/broadcast-channel
```

## How to use it

### makeBroadcastChannel

```ts
const { postMessage } = makeBroadcastChannel("test_channel");

postMessage({ id: 2, message: "hi" });

// Another browsing context
const { onMessage } = makeBroadcastChannel("test_channel");

onMessage(({ data }) => {
  console.log(data); // { id: 2, message: "hi" }
});
```

You can use the same channel easily across different components in the same context

```ts
const Component_1 = () => {
  const { postMessage } = makeBroadcastChannel("river");

  const onClick = () => {
    postMessage("hi");
  };

  return <button onClick={onClick}>Send Message</button>;
};

const Component_2 = () => {
  const { onMessage } = makeBroadcastChannel("river");
  const [message, setMessage] = createSignal("");

  onMessage(({ data }) => {
    setMessage(data);
  });

  return <div>{message()}</div>;
};

const App = () => {
  const { onMessage } = makeBroadcastChannel("river");

  onMessage(({ data }) => {
    console.log(data);
  });

  return (
    <>
      <Component_1 />
      <Component_2 />
    </>
  );
};
```

### createBroadcastChannel

Access the reactive `message()` signal that updates when postMessage is fired from other contexts

```ts
const { postMessage } = createBroadcastChannel("test_channel");

postMessage({ id: 2, message: "hi" });

// Another browsing context
const { message } = createBroadcastChannel("test_channel");

createEffect(
  on(
    message,
    data => {
      console.log(data); // { id: 2, message: "hi" }
    },
    { defer: true }
  )
);
```

## Demo

Here's a working example here: https://stackblitz.com/edit/vitejs-vite-5xren3?file=src%2Fmain.tsx

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
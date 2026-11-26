<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=post-message&version=2.0" alt="Solid Primitives post-message">
</p>

# @solid-primitives/post-message

[![docs](https://img.shields.io/badge/-docs-blue?style=for-the-badge)](https://primitives.solidjs.community/package/post-message)
[![version](https://img.shields.io/npm/v/@solid-primitives/post-message?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/post-message)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Secure messaging between windows, iframes and `MessagePort`s, with origin, source and channel checks. Built for cases like an editor talking to a preview iframe.

- **`makePostMessage`** — non-reactive channel; call `close()` to clean up.
- **`createPostMessage`** — reactive channel; the target can be an accessor, it is torn down with the owner, and it returns inert stubs on the server.

Security defaults:

- Messages from a window or iframe are accepted only when `event.source` is the target window **and** `event.origin` is in `allowedOrigins`. An empty list accepts nothing; `"*"` only applies if you list it.
- Sending to a window requires an explicit `targetOrigin`. There is no `"*"` default; omitting it throws a `TypeError` (and is a type error).
- `validate` drops anything that is not the shape you expect and narrows the type of incoming data.
- `channel` wraps outgoing data in an envelope and ignores messages that do not carry the same channel, so unrelated traffic never reaches your handlers.
- `MessagePort`s have no origin; the port itself is the trust boundary. `close()` stops listening but does not close the port.

## Installation

```bash
npm install @solid-primitives/post-message
# or
yarn add @solid-primitives/post-message
# or
pnpm add @solid-primitives/post-message
```

## `makePostMessage`

```ts
// Type
function makePostMessage<TIn = unknown, TOut = unknown>(
  target: Window | HTMLIFrameElement,
  options: {
    allowedOrigins: readonly string[];
    targetOrigin: string;
    validate?: (data: unknown) => data is TIn;
    channel?: string;
    receiver?: Window; // where "message" events arrive, defaults to window
  },
): {
  send: (data: TOut, transfer?: Transferable[]) => boolean;
  onMessage: (listener: (data: TIn, event: MessageEvent) => void) => () => void;
  close: () => void;
};
// MessagePort targets: options are optional and only validate/channel apply
function makePostMessage<TIn, TOut>(target: MessagePort, options?: { validate?; channel? }): /* same */;

// Example
const origin = "https://preview.example.com";
const channel = makePostMessage<{ type: "ready" }, { code: string }>(iframe, {
  allowedOrigins: [origin],
  targetOrigin: origin,
  channel: "editor",
  validate: (d): d is { type: "ready" } => (d as any)?.type === "ready",
});
channel.onMessage(msg => console.log(msg.type));
channel.send({ code: "console.log(1)" });
channel.close();
```

An iframe is resolved to its `contentWindow` each time it is needed, so navigations and late loads work. `send` returns `false` when there is nothing to send to (closed handle, iframe without a window).

## `createPostMessage`

```ts
// Type
function createPostMessage<TIn = unknown, TOut = unknown>(
  options: /* same options as makePostMessage */ & {
    target: MaybeAccessor<Window | HTMLIFrameElement | MessagePort | null | undefined>;
  },
): {
  message: Accessor<TIn | undefined>; // latest accepted message
  send: (data: TOut, transfer?: Transferable[]) => boolean;
  onMessage: (listener: (data: TIn, event: MessageEvent) => void) => () => void;
  close: () => void;
};

// Example
const [iframe, setIframe] = createSignal<HTMLIFrameElement>();
const { send, message } = createPostMessage<Reply, Command>({
  target: iframe,
  allowedOrigins: [origin],
  targetOrigin: origin,
  validate: isReply,
});

<iframe ref={setIframe} src={origin} />;
createEffect(message, reply => console.log(reply));
```

The channel re-attaches whenever `target` changes. The `message` signal updates on every accepted message, even when the payload is identical.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

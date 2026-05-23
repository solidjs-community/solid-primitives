<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Mediastream" alt="Solid Primitives Mediastream">
</p>

# @solid-primitives/mediastream

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/mediastream?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/mediastream)
[![size](https://img.shields.io/npm/v/@solid-primitives/mediastream?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/mediastream)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive primitives for working with [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) — microphones, cameras, and screen capture.

## Installation

```bash
npm install @solid-primitives/mediastream
# or
pnpm add @solid-primitives/mediastream
```

## Primitives

### `createStream`

Creates a reactive accessor for a `MediaStream` from a camera or microphone.

```ts
const [stream, { mute, stop }] = createStream(streamSource);
```

**Parameters**

- `streamSource` — `MediaDeviceInfo | MediaStreamConstraints | Accessor<...> | FalsyValue`

**Returns**

- `stream()` — `Accessor<MediaStream | undefined>` — the current stream (undefined while loading or stopped)
- `mute(muted?)` — mutes the stream; pass `false` to unmute
- `stop()` — stops the stream immediately

The stream stops automatically when the reactive owner is disposed. Wrap in `<Loading>` to handle the loading state:

```tsx
import { Loading } from "@solidjs/web";

const [stream] = createStream({ video: true });

<Loading fallback={<p>Requesting camera...</p>}>
  <video ref={el => createEffect(stream, s => { el.srcObject = s ?? null; })} autoplay />
</Loading>
```

### `createScreen`

Creates a reactive accessor for a display capture stream (screen, window, or browser tab).

```ts
const [stream, { mute, stop }] = createScreen(screenSource);
```

**Parameters**

- `screenSource` — `DisplayMediaStreamConstraints | undefined | Accessor<DisplayMediaStreamConstraints | undefined>`

Same controls as `createStream` but uses `getDisplayMedia` instead of `getUserMedia`. The stream stops automatically when the reactive owner is disposed.

```tsx
const [stream] = createScreen({ video: true });

<Loading fallback={<p>Requesting screen capture...</p>}>
  <video ref={el => createEffect(stream, s => { el.srcObject = s ?? null; })} autoplay />
</Loading>
```

### `createAmplitudeStream`

Creates a reactive signal with the RMS amplitude (0–100) from a microphone device.

```ts
const [amplitude, { stream, stop }] = createAmplitudeStream(streamSource?);
```

**Parameters**

- `streamSource?` — same as `createStream` (optional)

**Returns**

- `amplitude()` — `Accessor<number>` — value between 0 and 100
- `stream` — `Accessor<MediaStream | undefined>` — the underlying stream
- `stop()` — stops the amplitude measurement and underlying stream

```tsx
const [audioConstraints, setAudioConstraints] = createSignal<MediaStreamConstraints>();
const [level] = createAmplitudeStream(audioConstraints);

<Show
  when={audioConstraints()}
  fallback={<button onClick={() => setAudioConstraints({ audio: true })}>Start</button>}
>
  <meter min="0" max="100" value={level()} />
</Show>
```

### `createAmplitudeFromStream`

Creates an amplitude signal from an existing stream accessor.

```ts
const [amplitude, stop] = createAmplitudeFromStream(stream);
```

**Parameters**

- `stream` — `MaybeAccessor<MediaStream | undefined>`

**Returns**

- `amplitude()` — `Accessor<number>` — value between 0 and 100
- `stop()` — stops the amplitude measurement

The measurement stops automatically when the reactive owner is disposed.

### `createMediaPermissionRequest`

Requests media permissions from the user by briefly opening then immediately stopping a stream.

```ts
createMediaPermissionRequest(source?);
```

**Parameters**

- `source?` — `'audio' | 'video' | MediaStreamConstraints` — defaults to both audio and video

Returns a `Promise<void>` that resolves once the permission prompt is handled.

```ts
// Request both microphone and camera permissions
await createMediaPermissionRequest();

// Request only microphone permission
await createMediaPermissionRequest('audio');
```

Use `createPermission` from `@solid-primitives/permission` to reactively observe the resulting permission state.

## Breaking Changes from `@solid-primitives/stream`

This package replaces `@solid-primitives/stream` with full Solid.js v2 compatibility.

- **`createStream` / `createScreen`**: return type changed from `[Resource<MediaStream>, ResourceActions & { stop, mute }]` to `[Accessor<MediaStream | undefined>, { stop, mute }]`. The `mutate` and `refetch` controls are removed; reactivity is driven by the source accessor directly.
- **`createAmplitudeStream`**: return type simplified — second element is now `{ stream, stop }` (no `mutate` / `refetch`).
- **`isServer`**: now imported from `@solidjs/web` internally.
- **Async loading state**: use `<Loading>` from `@solidjs/web` instead of inspecting `stream.loading`.
- **Error handling**: wrap in `<Errored>` from `@solidjs/web` instead of inspecting `stream.error`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

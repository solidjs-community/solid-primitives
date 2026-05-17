<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Share" alt="Solid Primitives Share">
</p>

# @solid-primitives/share

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/share?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/share)
[![size](https://img.shields.io/npm/v/@solid-primitives/share?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/share)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for supporting sharing of resources on social media and beyond.

- [`createSocialShare`](#createsocialshare) - A primitive for sharing on social media and beyond.
- [`makeWebShare`](#makewebshare) - A simple non-reactive base primitive for the Web Share API.
- [`createWebShare`](#createwebshare) - A reactive action-based primitive for the Web Share API with status tracking.

## Installation

```
npm install @solid-primitives/share
# or
yarn add @solid-primitives/share
# or
pnpm add @solid-primitives/share
```

## `createSocialShare`

### How to use it

```ts
import { createSocialShare, BLUESKY } from "@solid-primitives/share";

const { share, close, isSharing } = createSocialShare(() => ({
  title: "SolidJS.com",
  url: "https://www.solidjs.com",
  description: "Simple and well-behaved reactivity!",
}));

share(BLUESKY);
```

### Definition

```ts
function createSocialShare(
  options: Accessor<{
    network?: Network;
    url: string;
    title: string;
    description: string;
    quote?: string;
    hashtags?: string;
    twitterUser?: string;
    media?: string;
    tag?: string;
    popup?: SharePopupOptions;
  }>,
  controller: Window = window,
): SocialShareResult;

type SocialShareResult = {
  share: (network?: Network) => void;
  close: () => void;
  isSharing: Accessor<boolean>;
};
```

### Network List

The following are a list of supported networks that may be imported from the share package.

| Network       | `url`              | `title`            | `description`      | Extras/Comments                                                                                             |
| ------------- | ------------------ | ------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Bluesky       | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| Buffer        | :heavy_check_mark: | :heavy_check_mark: | :x:                |                                                                                                             |
| Email         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| EverNote      | :heavy_check_mark: | :heavy_check_mark: | :x:                |                                                                                                             |
| Facebook      | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | `hashtags` A list of comma-separated hashtags, only the first one will be used.<br/>`quote` Facebook quote. |
| FlipBoard     | :heavy_check_mark: | :heavy_check_mark: | :x:                |                                                                                                             |
| HackerNews    | :heavy_check_mark: | :heavy_check_mark: | :x:                |                                                                                                             |
| InstaPaper    | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| Line          | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| LinkedIn      | :heavy_check_mark: | :x:                | :x:                |                                                                                                             |
| Messenger     | :heavy_check_mark: | :x:                | :x:                |                                                                                                             |
| Odnoklassniki | :heavy_check_mark: | :heavy_check_mark: | :x:                |                                                                                                             |
| Pinterest     | :heavy_check_mark: | :heavy_check_mark: | :x:                | `media` URL of an image describing the content.                                                             |
| Pocket        | :heavy_check_mark: | :heavy_check_mark: | :x:                |                                                                                                             |
| Quora         | :heavy_check_mark: | :heavy_check_mark: | :x:                |                                                                                                             |
| Reddit        | :heavy_check_mark: | :heavy_check_mark: | :x:                |                                                                                                             |
| Skype         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| SMS           | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| Telegram      | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| Tumblr        | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| Twitter       | :heavy_check_mark: | :heavy_check_mark: | :x:                | `hashtags` A list of comma-separated hashtags.<br/>`twitterUser` Twitter user to mention.                   |
| Viber         | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| VK            | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | `media` URL of an image describing the content.                                                             |
| Warpcast      | :heavy_check_mark: | :heavy_check_mark: | :x:                | Farcaster decentralized social network.                                                                     |
| Weibo         | :heavy_check_mark: | :heavy_check_mark: | :x:                | `media` URL of an image describing the content.                                                             |
| WhatsApp      | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |
| Wordpress     | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | `media` URL of an image describing the content.                                                             |
| X             | :heavy_check_mark: | :heavy_check_mark: | :x:                | `hashtags` A list of comma-separated hashtags.<br/>`twitterUser` X user to mention.                         |
| Xing          | :heavy_check_mark: | :heavy_check_mark: | :x:                |                                                                                                             |
| Yammer        | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |                                                                                                             |

> **Deprecated:** `STUMBLEUPON` (shut down 2018) and `MESSANGER` (typo — use `MESSENGER`) are still exported for backwards compatibility but will be removed in a future version.

For the networks `Bluesky`, `Line`, `Skype`, `SMS`, `Telegram`, `Viber`, `WhatsApp`, and `Yammer` the shared content is a string of the form: "`$title` `$url` `$description`".

You can also provide a custom network by formatting a URL string with the following replacement markers:

- `@u`: URL
- `@t`: Title
- `@d`: Description
- `@q`: Quote
- `@h`: Hashtags
- `@m`: Media
- `@tu`: X/Twitter user mention

Example:

```ts
const x: Network = "https://www.x.com/intent/tweet?text=@t&url=@u&hashtags=@h@tu";
```

### Demo

You may view a working example [here on Stackblitz](https://stackblitz.com/edit/vitejs-vite-vz1yr8?file=src/App.tsx).

### Acknowledgements

A portion of this primitive was built from https://github.com/nicolasbeauvais/vue-social-sharing/blob/master/src/share-network.js.

## `makeWebShare`

A simple non-reactive base primitive wrapping the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API). Returns a `share` function that rejects with a descriptive message if the browser does not support sharing or file sharing.

### How to use it

```ts
import { makeWebShare } from "@solid-primitives/share";

const share = makeWebShare();

try {
  await share({ url: "https://solidjs.com" });
} catch (e) {
  console.error(e);
}
```

## `createWebShare`

A reactive, action-based primitive for the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API). Call `share` imperatively on a user gesture and observe the result via reactive accessors.

### How to use it

```ts
import { createWebShare } from "@solid-primitives/share";

const { share, pending, status, message } = createWebShare();
```

```tsx
<button
  disabled={pending()}
  onClick={() => share({ url: location.href, title: document.title })}
>
  {pending() ? "Sharing..." : "Share"}
</button>

<Show when={status() === false}>
  <p>Share failed: {message()}</p>
</Show>
```

### Definition

```ts
function createWebShare(): WebShareResult;

type WebShareResult = {
  /** Imperatively trigger the Web Share API with the provided data. */
  share: (data: ShareData) => Promise<void>;
  /** True while the share dialog is open / the promise is pending. */
  pending: Accessor<boolean>;
  /** True on success, false on failure, undefined before first share. */
  status: Accessor<boolean | undefined>;
  /** The error message if the share failed, otherwise undefined. */
  message: Accessor<string | undefined>;
};
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

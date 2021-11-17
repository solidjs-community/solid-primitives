---
Name: script-loader
Package: "@solid-primitives/script-loader"
Primitives: createScriptLoader
---

# @solid-primitives/script-loader

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/script-loader)](https://bundlephobia.com/package/@solid-primitives/script-loader)
[![size](https://img.shields.io/npm/v/@solid-primitives/script-loader)](https://www.npmjs.com/package/@solid-primitives/script-loader)

Creates a primitive to load scripts dynamically, either for external services or jsonp requests

## How to use it

```ts
const [script: HTMLScriptElement, remove: () => void] = createScriptLoader({
  url: string | Accessor<string>,
  type?: string,
  onload?: () => void,
  onerror?: () => void
});

// For example, to use recaptcha:
createScriptLoader({
  url: 'https://www.google.com/recaptcha/enterprise.js?render=my_token'
  onload: async () => {
    await grecaptcha.enterprise.ready();
    const token = await grecaptcha.enterprise.execute('my_token', {action: 'login'});
    // do your stuff...
  }
});
```

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release.

</details>

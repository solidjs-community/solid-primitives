---
Name: i18n
Package: "@solid-primitives/i18n"
Primitives: createI18nContext, useI18n
---

# @solid-primitives/i18n

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/i18n)](https://bundlephobia.com/package/@solid-primitives/i18n)
[![size](https://img.shields.io/npm/v/@solid-primitives/i18n)](https://www.npmjs.com/package/@solid-primitives/i18n)

Creates a method for internationalization support. This primitive set is largely inspired by [dlv](https://github.com/developit/dlv/blob/master/index.js) and passes all its tests.

## How to use it

Install it:

```bash
yarn add @solid-primitives/i18n
```

Use it:

```tsx
import { render } from "solid-js/web";
import { Component, createSignal } from "solid-js";

import { I18nContext, createI18nContext, useI18n } from "@solid-primitives/i18n";

const App: Component = () => {
  const [t, { add, locale, dict }] = useI18n();
  const [name, setName] = createSignal("Greg");

  const addLanguage = () => {
    add("sw", { hello: "hej {{ name }}, hur mar du?" });
    locale("sw");
  };

  return (
    <>
      <button onClick={() => locale("fr")}>fr</button>
      <button onClick={() => locale("en")}>en</button>
      <button onClick={() => locale("unknownLanguage")}>unknown language</button>
      <button onClick={addLanguage}>add and set swedish</button>
      <input value={name()} onInput={e => setName(e.target.value)} />
      <hr />
      <h1>{t("hello", { name: name() }, "Hello {{ name }}!")}!</h1>
      <p>{locale()}</p>
      <pre>
        <code>{JSON.stringify(dict("sw"), null, 4)}</code>
      </pre>
    </>
  );
};

const dict = {
  fr: {
    hello: "bonjour {{ name }}, comment vas-tu ?"
  },
  en: {
    hello: "hello {{ name }}, how are you?"
  }
};
const value = createI18nContext(dict, "fr");

render(
  () => (
    <I18nContext.Provider value={value}>
      <App />
    </I18nContext.Provider>
  ),
  document.getElementById("app")
);
```

## Demo

You may view a working example here: https://codesandbox.io/s/use-i18n-rd7jq?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First commit of the i18n primitive.

1.0.0

General package clean-up and added testing facility.

</details>

<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=I18n" alt="Solid Primitives I18n">
</p>

# @solid-primitives/i18n

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/i18n?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/i18n)
[![size](https://img.shields.io/npm/v/@solid-primitives/i18n?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/i18n)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

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

See [CHANGELOG.md](./CHANGELOG.md)

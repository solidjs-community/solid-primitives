<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=I18n" alt="Solid Primitives I18n">
</p>

# @solid-primitives/i18n

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/i18n?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/i18n)
[![size](https://img.shields.io/npm/v/@solid-primitives/i18n?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/i18n)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Library of primitives for providing internationalization support.

## Installation

```bash
npm i @solid-primitives/i18n
# or
pnpm add @solid-primitives/i18n
# or
yarn add @solid-primitives/i18n
```

## `createI18nContext`

Creates a method for internationalization support. This primitive set is largely inspired by [dlv](https://github.com/developit/dlv/blob/master/index.js) and passes all its tests.

### How to use it

```tsx
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
    hello: "bonjour {{ name }}, comment vas-tu ?",
  },
  en: {
    hello: "hello {{ name }}, how are you?",
  },
};
const value = createI18nContext(dict, "fr");

<I18nContext.Provider value={value}>
  <App />
</I18nContext.Provider>;
```

## `createChainedI18n`

Creates a chained dictionary and manages the locale. Provides a proxy wrapper around translate so you can do chained calls that always returns with the current locale. IE t.hello()

### How to use it

```ts
import { createChainedI18n } from "@solid-primitives/i18n";

const dictionaries = {
  fr: {
    hello: "bonjour {{ name }}, comment vas-tu ?",
    goodbye: ({ name }: { name: string }) => `au revoir ${name}`,
  },
  en: {
    hello: "hello {{ name }}, how are you?",
    goodbye: ({ name }: { name: string }) => `goodbye ${name}`,
  },
};

const [t, { locale, setLocale, getDictionary }] = createChainedI18n({
  dictionaries,
  locale: "en", // Starting locale
});

createEffect(() => {
  t.hello({ name: "Mathiew" });
});
```

### `createChainedI18nContext`

Creates chained I18n state wrapped in a Context Provider to be shared with the app using the component tree.

```tsx
import { createChainedI18nContext } from "@solid-primitives/i18n";

const { I18nProvider, useI18nContext } = makeChainedI18nContext({
  dictionaries,
  locale: "en", // Starting locale
});

export const useI18n = () => {
  const context = useI18nContext();
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
};

const App: Component = () => {
  const [t, { locale, setLocale, getDictionary }] = useI18n();
  const [name, setName] = createSignal("Greg");

  return (
    <>
      <button onClick={() => setLocale("fr")}>fr</button>
      <button onClick={() => setLocale("en")}>en</button>
      <button onClick={addLanguage}>add and set swedish</button>
      <input value={name()} onInput={e => setName(e.target.value)} />
      <hr />
      <h1>{t.hello({ name: name() })}!</h1>
      <p>{locale()}</p>
      <p>{t.goodbye({ name: name() })}</p>
    </>
  );
};

<I18nContext.Provider value={value}>
  <App />
</I18nContext.Provider>;
```

## `useScopedI18n`

Use `useScopedI18n` to create a module-specific translate.

```tsx

const dict = {
  en: {
    login: {
      username: 'User name',
      password: 'Password',
      login: 'Login'
  },
  fr: {
     ...
  }
 }
}

export const LoginView = () => {
  const [t] = useScopedI18n('login');
  return <>
      <div>{t('username')}<input /></div>
      <div>{t('password')}<input /></div>
      <button>{t('login') }</button>
  </>
}

```

## Demo

You may view a working example of createI18nContext here: https://codesandbox.io/s/use-i18n-rd7jq?file=/src/index.tsx

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

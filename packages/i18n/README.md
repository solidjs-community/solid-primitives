<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=I18n" alt="Solid Primitives I18n">
</p>

# @solid-primitives/i18n

[![size](https://img.shields.io/badge/size-1.09_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/i18n)
[![size](https://img.shields.io/npm/v/@solid-primitives/i18n?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/i18n)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Library of primitives for providing internationalization support.

## Installation

```bash
npm i @solid-primitives/i18n
# or
pnpm add @solid-primitives/i18n
# or
yarn add @solid-primitives/i18n
```

## How to use it

The library consists of multiple small and composable primitives that can be used together to create an internationalization solution that fits your needs.

### Defining dictionaries

Dictionary is any plain js object that contains translations for a given language. It can be nested and contain functions.

Dictionaries can be defined in inline in js, or imported from json files.

```ts
const en_dict = {
  hello: "hello {{ name }}, how are you?",
  goodbye: (name: string) => `goodbye ${name}`,
  food: {
    meat: "meat",
    fruit: "fruit",
  },
};

type Dict = typeof en_dict;

const fr_dict: Dict = {
  hello: "bonjour {{ name }}, comment vas-tu ?",
  goodbye: (name: string) => `au revoir ${name}`,
  food: {
    meat: "viande",
    fruit: "fruit",
  },
};
```

When using large dictionary files, JSON files are [faster to load](https://www.youtube.com/watch?v=ff4fgQxPaO0). Additionally, we recommend keeping a flat JSON structure so you don't need to flatten the object on the client for best performance.

### Dynamic loading

Use `createMemo` with an async function to load dictionaries on demand. The translator suspends inside a `<Loading>` boundary until the dictionary resolves.

```tsx
import { type Component, createMemo, createSignal, Loading } from "solid-js";
import * as i18n from "@solid-primitives/i18n";

/*
Assuming the dictionaries are in the following structure:
./i18n
  en.ts
  fr.ts
  es.ts
And all export a `dict` object
*/

// use `type` to not include the actual dictionary in the bundle
import type * as en from "./i18n/en.js";

export type Locale = "en" | "fr" | "es";
export type RawDictionary = typeof en.dict;
export type Dictionary = i18n.Flatten<RawDictionary>;

async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  const dict: RawDictionary = (await import(`./i18n/${locale}.ts`)).dict;
  return i18n.flatten(dict); // flatten the dictionary to make all nested keys available top-level
}

const App: Component = () => {
  const [locale, setLocale] = createSignal<Locale>("en");

  const dict = createMemo(async () => fetchDictionary(locale()));
  const t = i18n.translator(dict, i18n.resolveTemplate);

  return (
    <Loading fallback={<div>Loading...</div>}>
      <div>
        <p>Current locale: {locale()}</p>
        <div>
          <button onClick={() => setLocale("en")}>English</button>
          <button onClick={() => setLocale("fr")}>French</button>
          <button onClick={() => setLocale("es")}>Spanish</button>
        </div>

        <h4>{t("hello", { name: "John" })}</h4>
        <h4>{t("goodbye", { name: "John" })}</h4>
        <h4>{t("food.meat")}</h4>
      </div>
    </Loading>
  );
};
```

### With transitions

Use `isPending(dict)` to show visual feedback while a locale switch is in progress.

```tsx
import { createMemo, isPending, Loading } from "solid-js";

const dict = createMemo(async () => fetchDictionary(locale()));

return (
  <div style={{ opacity: isPending(dict) ? 0.5 : 1 }}>
    <Loading>
      <App />
    </Loading>
  </div>
);
```

### Static dictionaries

If you don't need to load dictionaries dynamically, use `createMemo` with a synchronous function.

```tsx
import * as en from "./i18n/en.js";
import * as fr from "./i18n/fr.js";
import * as es from "./i18n/es.js";

const dictionaries = {
  en: en.dict,
  fr: fr.dict,
  es: es.dict,
};

const [locale, setLocale] = createSignal<Locale>("en");

const dict = createMemo(() => i18n.flatten(dictionaries[locale()]));

const t = i18n.translator(dict);
```

### Templates

Templates are strings that can contain placeholders. Placeholders are defined with double curly braces `{{ placeholder }}`.

Templates can be resolved by calling `resolveTemplate` function. e.g.

```ts
i18n.resolveTemplate("hello {{ name }}!", { name: "John" }); // => 'hello John!'
```

By default, the `translator` function will not resolve templates. You can pass `resolveTemplate` as the second argument to `translator` to enable template resolution. Or use a custom template resolver.

```ts
const dict = {
  hello: "hello {{ name }}!",
};

const t1 = i18n.translator(() => dict);

t1("hello", { name: "John" }); // => 'hello {{ name }}!'

const t2 = i18n.translator(() => dict, i18n.resolveTemplate);

t2("hello", { name: "John" }); // => 'hello John!'
```

### Rich text

Sometimes a translation needs to contain a link, or otherwise wrap part of the text in a component — not just interpolate a value.

For dictionaries you own in TS/TSX, a dictionary entry can simply be a function that returns JSX. Function entries have no restrictions on argument or return types, so this works with full type-checking and no extra API:

```tsx
const dict = {
  forMoreInfo: (clickHere: JSX.Element) => <>For more information, {clickHere}</>,
  seeGuidelines: (guidelines: (text: string) => JSX.Element, name: string) => (
    <>Please refer to {guidelines(name)}</>
  ),
};

const t = i18n.translator(() => dict);

t("forMoreInfo", <a href="/info">click here</a>);
t("seeGuidelines", text => <a href="/guidelines">{text}</a>, "the guidelines");
```

For dictionaries loaded from JSON (translated strings, no functions allowed), use `resolveRichTemplate` in place of `resolveTemplate` to allow JSX values in `{{ placeholder }}` substitutions:

```tsx
const dict = {
  forMoreInfo: "For more information, {{ clickHere }}",
};

const t = i18n.translator(() => dict, i18n.resolveRichTemplate);

t("forMoreInfo", { clickHere: <a href="/info">click here</a> }); // => JSX.Element
```

To wrap part of a translated string in a component, e.g. `<guidelines>the guidelines</guidelines>`, resolve `{{ }}` variables first with `resolveTemplate`, then pass the result through `richText` to map `<tag>` markup to a renderer:

```tsx
const dict = {
  message: "Please refer to <guidelines>{{ name }}</guidelines>",
};

const t = i18n.translator(() => dict, i18n.resolveTemplate);

i18n.richText(t("message", { name: "the guidelines" }), {
  guidelines: text => <a href="/guidelines">{text}</a>,
});
```

Tag names aren't type-checked against the `tags` map — a typo can't be caught at compile time. To catch it at runtime instead, an unmapped tag logs a dev-only warning and renders its contents as plain text; this check is stripped from production builds. Tags don't nest.

### Missing keys

By default, a path that isn't present in the dictionary resolves to `undefined` — same as when the dictionary itself hasn't loaded yet. To make missing translations visible instead of silently rendering blank, pass an `onMissingKey` handler as the third argument to `translator`. It's only called when the dictionary itself is loaded but the requested path isn't in it.

```ts
const dict = { hello: "hello!" };

// fall back to the path itself, e.g. "goodbye"
const t = i18n.translator(() => dict, i18n.resolveTemplate, i18n.missingKeyAsPath);

t("hello"); // => 'hello!'
t("goodbye"); // => 'goodbye'

// or provide a custom handler, e.g. to report missing translations
const t2 = i18n.translator(
  () => dict,
  i18n.resolveTemplate,
  path => {
    reportMissingTranslation(path);
    return "";
  },
);
```

### Modules

Splitting the dictionary into multiple modules can be useful when you have a large dictionary and want to avoid loading the entire dictionary at once.

For example, if our app had a separate `login` and `dashboard` modules, we could split the dictionary into 3 modules: (`common`, `login` and `dashboard`).

```
i18n/
  en.json
  pl.json
modules/
  login/
    i18n/
      en.json
      pl.json
    login.ts
  ...
root.ts
```

Translations in `root.ts` would be available in all modules. Translations in `login.ts` would be available only in `login` module, and the same for other modules.

```ts
// root.ts

const [locale, setLocale] = createSignal<Locale>("en");
const commonDict = createMemo(async () => fetchCommonDictionary(locale()));
const t = i18n.translator(commonDict);

// login/login.ts

const loginDict = createMemo(async () => fetchLoginDictionary(locale()));

// translator only for login module
const loginT = i18n.translator(loginDict);

t("welcome"); // => 'Welcome from common translations!'
loginT("welcome"); // => 'Welcome from login translations!'
```

Or combine multiple dictionaries into one, prefixing the keys with the module name.

```ts
const combined_dict = createMemo(() => ({
  ...i18n.prefix(commonDict(), "common"),
  ...i18n.prefix(loginDict(), "login"),
}));

const t = i18n.translator(combined_dict);

t("common.welcome"); // => 'Welcome from common translations!'
t("login.welcome"); // => 'Welcome from login translations!'
```

To scope an existing translator to a module, you can use `scopedTranslator`.

```ts
const dict = {
  "login.username": "User name",
  "login.password": "Password",
  "login.login": "Login",
  // ...
};

const t = i18n.translator(() => dict);

const loginT = i18n.scopedTranslator(t, "login");

loginT("username"); // => 'User name'
```

### Nested objects syntax

String paths passesd to the translator don't allow for taking advantage of TypeScript's "Go to definition", and "Find all references", "Rename" features.

If you prefer to use nested objects instead of dot notation, you can use `chainedTranslator` helper.

It takes a dictionary _(not flattened)_ to map it's shape and a translator function for resolving the translations.

```ts
const dict = {
  greetings: {
    hello: "hello {{ name }}!",
    hi: "hi!",
  },
  goodbye: (name: string) => `goodbye ${name}!`,
};
const flat_dict = i18n.flatten(dict);

const t = i18n.translator(() => flat_dict, i18n.resolveTemplate);

const chained = i18n.chainedTranslator(dict, t);

chained.greetings.hello({ name: "John" }); // => "hello John!"
chained.greetings.hi(); // => "hi!"
chained.goodbye("John"); // => "goodbye John!"
```

Alternatively you can use `proxyTranslator` that is implemented using `new Proxy` so it doesn't require a directory object to be passed as source.

```ts
const proxy = i18n.proxyTranslator(t);

proxy.greetings.hello({ name: "John" }); // => "hello John!"
proxy.greetings.hi(); // => "hi!"
proxy.goodbye("John"); // => "goodbye John!"
```

Using a proxy will have a slight performance impact, so it's recommended to use `chainedTranslator` if possible. But it can be useful when you don't have access to the dictionary object. Or want to mock the translations in tests.

```ts
const proxy = i18n.proxyTranslator(path => path);

proxy.greetings.hello({ name: "John" }); // => "greetings.hello"
proxy.greetings.hi(); // => "greetings.hi"
proxy.goodbye("John"); // => "goodbye"
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

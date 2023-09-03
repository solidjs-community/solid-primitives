import { Component, createResource, createSignal, Suspense, useTransition } from "solid-js";
import { dict as en_dict } from "./en.js";
import * as i18n from "../src/index.js";

export type Locale = "en" | "fr" | "es";
export type I18nDict = typeof en_dict;
export type I18nFlatDict = i18n.Flatten<I18nDict>;

const App: Component = () => {
  const [locale, setLocale] = createSignal<Locale>("en");
  const [name, setName] = createSignal("User");

  const [dict] = createResource(
    locale,
    async locale => {
      await new Promise(r => setTimeout(r, 600)); // to see the transition

      const dict: I18nDict = locale === "en" ? en_dict : (await import(`./${locale}.ts`)).dict;
      return i18n.flatten(dict);
    },
    { initialValue: i18n.flatten(en_dict) },
  );

  const t = i18n.translator(dict, i18n.resolveTemplate);

  const [underTransition, startTransition] = useTransition();

  function switchLocale(locale: Locale) {
    startTransition(() => {
      setLocale(locale);
    });
  }

  return (
    <div class="center-child w-full">
      <div class="my-24 transition-opacity" classList={{ "opacity-50": underTransition() }}>
        <Suspense>
          <p>
            Current locale: <b>{locale()}</b>
          </p>
          <div>
            <button onClick={() => switchLocale("en")}>English</button>
            <button onClick={() => switchLocale("fr")}>French</button>
            <button onClick={() => switchLocale("es")}>Spanish</button>
          </div>

          <div class="mb-8" />
          <button onClick={() => setName(n => (n === "User" ? "Viewer" : "User"))}>
            Change Name
          </button>
          <h4>{t("hello", { name: name() })}</h4>
          <h4>{t("goodbye", { name: name() })}</h4>
          <h4>{t("food.meat")}</h4>
        </Suspense>
      </div>
    </div>
  );
};

export default App;

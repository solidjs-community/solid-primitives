import { Component, createResource, createSignal, Show, Suspense, useTransition } from "solid-js";
import type * as en from "./en.js";
import * as i18n from "../src/index.js";

export type Locale = "en" | "fr" | "es";
export type RawDictionary = typeof en.dict;
export type Dictionary = i18n.Flatten<RawDictionary>;

async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  await new Promise(r => setTimeout(r, 600)); // to see the transition

  const dict: RawDictionary = (await import(`./${locale}.ts`)).dict;
  return i18n.flatten(dict);
}

const App: Component = () => {
  const [locale, setLocale] = createSignal<Locale>("en");
  const [name, setName] = createSignal("User");

  const [dict] = createResource(locale, fetchDictionary);

  const [duringTransition, startTransition] = useTransition();

  function switchLocale(locale: Locale) {
    startTransition(() => setLocale(locale));
  }

  return (
    <Suspense>
      <Show when={dict()}>
        {dict => {
          const t = i18n.translator(dict, i18n.resolveTemplate);

          return (
            <div class="center-child w-full">
              <div
                class="my-24 transition-opacity"
                classList={{ "opacity-50": duringTransition() }}
              >
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
              </div>
            </div>
          );
        }}
      </Show>
    </Suspense>
  );
};

export default App;

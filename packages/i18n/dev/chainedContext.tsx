import { Component, createSignal } from "solid-js";

import { makeChainedI18nContext } from "../src/index";
import { dict } from "../test/setup";

const { I18nProvider, useI18nContext } = makeChainedI18nContext({
  dictionaries: dict,
  locale: "en"
});

export const useI18n = () => {
  const context = useI18nContext();
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
};

const LanguageToggle: Component = () => {
  const [, { setLocale }] = useI18n();

  return (
    <div>
      <button onClick={() => setLocale("en")}>English</button>
      <button onClick={() => setLocale("fr")}>French</button>
      <button onClick={() => setLocale("es")}>Spanish</button>
    </div>
  );
};

const App: Component = () => {
  const [t, { locale }] = useI18n();
  const [name, setName] = createSignal("User");

  return (
    <div>
      <p>
        Current locale: <b>{locale()}</b>
      </p>
      <button onClick={() => setName(n => (n === "User" ? "Viewer" : "User"))}>Change Name</button>
      <div style={{ "margin-bottom": "15px" }} />
      <h4>{t.hello({ name: name() })}</h4>
      <h4>{t.goodbye({ name: name() })}</h4>
      <h4>{t.food.meat()}</h4>
    </div>
  );
};

export const ChainedContextApp = () => {
  return (
    <I18nProvider>
      <App />
      <LanguageToggle />
    </I18nProvider>
  );
};

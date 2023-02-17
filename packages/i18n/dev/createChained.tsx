import { Accessor, Component, createContext, createSignal, useContext } from "solid-js";

import { createChainedI18n } from "../src/index";
import { dict } from "../test/setup";

// -------------------------- Not using context -------------------
const dictionaries = createChainedI18n(dict, ["en", "fr", "es"]);

const I18nContext = createContext<{
  dictionaries: typeof dictionaries;
  locale: Accessor<keyof typeof dictionaries>;
  setLocale: (locale: keyof typeof dictionaries) => void;
} | null>(null);

const useI18nContext = () => {
  const i18n = useContext(I18nContext)!;

  return [
    () => i18n.dictionaries[i18n.locale()],
    { locale: i18n.locale, setLocale: i18n.setLocale }
  ] as const;
};

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
      <h4>{t().hello({ name: name() })}</h4>
      <h4>{t().goodbye({ name: name() })}</h4>
      <h4>{t().food.meat()}</h4>
    </div>
  );
};

export const NoContextI18nApp = () => {
  const [locale, setLocale] = createSignal<keyof typeof dictionaries>("en");

  return (
    <I18nContext.Provider value={{ dictionaries, locale, setLocale }}>
      <App />
      <LanguageToggle />
    </I18nContext.Provider>
  );
};

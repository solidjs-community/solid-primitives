import { Component, createSignal } from "solid-js";
import { render } from "solid-js/web";

import { makeChainedI18nContext } from "../src/index";
import { dict } from "../test/setup";

const { I18nProvider, useI18n } = makeChainedI18nContext({ dictionaries: dict, locale: "en" });

export { useI18n };

const LanguageToggle: Component = () => {
  const [, { locale }] = useI18n();

  return (
    <div>
      <button onClick={() => locale("en")}>English</button>
      <button onClick={() => locale("fr")}>French</button>
      <button onClick={() => locale("es")}>Spanish</button>
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
      <h1>{t().hello({ name: name() })}</h1>
      <h1>{t().goodbye({ name: name() })}</h1>
    </div>
  );
};

const Root = () => {
  return (
    <I18nProvider>
      <App />
      <LanguageToggle />
    </I18nProvider>
  );
};

render(() => <Root />, document.getElementById("root")!);

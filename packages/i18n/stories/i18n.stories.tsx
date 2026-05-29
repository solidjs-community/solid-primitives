import { createMemo, createSignal, isPending, Loading } from "solid-js";
import preview from "../../../.storybook/preview.js";
import * as i18n from "@solid-primitives/i18n";
import readme from "../README.md?raw";
import {
  Badge,
  Button,
  ButtonRow,
  Card,
  colors,
  Container,
  font,
  Section,
  Separator,
  StatRow,
  TextField,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/i18n",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

// ─── Shared dictionaries ─────────────────────────────────────────────────────

const en_raw = {
  greeting: i18n.template<{ name: string }>("Hello, {{ name }}!"),
  farewell: ({ name }: { name: string }) => `Goodbye, ${name}!`,
  food: { meat: "meat", fruit: "fruit" },
};

type RawDict = typeof en_raw;

const staticDicts: Record<string, RawDict> = {
  en: en_raw,
  fr: {
    greeting: "Bonjour, {{ name }} !" as any,
    farewell: ({ name }: { name: string }) => `Au revoir, ${name} !`,
    food: { meat: "viande", fruit: "fruit" },
  },
  es: {
    greeting: "¡Hola, {{ name }}!" as any,
    farewell: ({ name }: { name: string }) => `¡Adiós, ${name}!`,
    food: { meat: "carne", fruit: "fruta" },
  },
};

type Locale = "en" | "fr" | "es";

// ─── Story 1: translator ──────────────────────────────────────────────────────

export const TranslatorStory = meta.story({
  name: "translator",
  parameters: {
    docs: {
      description: {
        story:
          "`translator(dict, resolveTemplate)` returns a type-safe `t()` function. Locale switching happens by swapping the reactive dict signal — no re-creation needed. Supports `{{ placeholder }}` template strings, function values called with provided arguments, and nested keys via dot notation.",
      },
    },
  },
  render: () => {
    const [locale, setLocale] = createSignal<Locale>("en");
    const [name, setName] = createSignal("World");

    const dict = createMemo(() => i18n.flatten(staticDicts[locale()]));
    const t = i18n.translator(dict, i18n.resolveTemplate);

    const localeLabel = () =>
      locale() === "en" ? "English" : locale() === "fr" ? "Français" : "Español";

    return (
      <Container width={400}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
          }}
        >
          <span style={{ "font-size": font.sizeSm, color: colors.muted }}>Active locale</span>
          <Badge variant="info">{localeLabel()}</Badge>
        </div>

        <ButtonRow>
          <Button
            variant={locale() === "en" ? "primary" : "outline"}
            onClick={() => setLocale("en")}
          >
            English
          </Button>
          <Button
            variant={locale() === "fr" ? "primary" : "outline"}
            onClick={() => setLocale("fr")}
          >
            Français
          </Button>
          <Button
            variant={locale() === "es" ? "primary" : "outline"}
            onClick={() => setLocale("es")}
          >
            Español
          </Button>
        </ButtonRow>

        <TextField
          label="Name — substituted into template strings"
          value={name()}
          onChange={setName}
          placeholder="Enter a name"
        />

        <Card>
          <StatRow
            label='t("greeting", { name })'
            value={t("greeting", { name: name() })}
          />
          <Separator />
          <StatRow
            label='t("farewell", { name })'
            value={t("farewell", { name: name() })}
          />
          <Separator />
          <StatRow label='t("food.meat")' value={t("food.meat")} />
          <Separator />
          <StatRow label='t("food.fruit")' value={t("food.fruit")} />
        </Card>
      </Container>
    );
  },
});

// ─── Story 2: Dynamic Loading ─────────────────────────────────────────────────

async function simulateFetch(locale: Locale): Promise<i18n.Flatten<RawDict>> {
  await new Promise(r => setTimeout(r, 400));
  return i18n.flatten(staticDicts[locale]);
}

export const DynamicLoadingStory = meta.story({
  name: "Dynamic Loading",
  parameters: {
    docs: {
      description: {
        story:
          "Pass an async `createMemo` to `translator()` to load dictionaries lazily. Wrap translated content in `<Loading>` to suspend until the first dictionary resolves. `isPending()` inside the loaded content returns `true` during subsequent locale transitions — use it to dim the UI while the next dictionary fetches (simulated 400 ms delay).",
      },
    },
  },
  render: () => {
    const [locale, setLocale] = createSignal<Locale>("en");
    const [name, setName] = createSignal("World");

    const dict = createMemo(async () => simulateFetch(locale()));
    const t = i18n.translator(dict, i18n.resolveTemplate);

    return (
      <Container width={400}>
        <ButtonRow>
          <Button
            variant={locale() === "en" ? "primary" : "outline"}
            onClick={() => setLocale("en")}
          >
            English
          </Button>
          <Button
            variant={locale() === "fr" ? "primary" : "outline"}
            onClick={() => setLocale("fr")}
          >
            Français
          </Button>
          <Button
            variant={locale() === "es" ? "primary" : "outline"}
            onClick={() => setLocale("es")}
          >
            Español
          </Button>
        </ButtonRow>

        <TextField label="Name" value={name()} onChange={setName} placeholder="Enter a name" />

        <Loading
          fallback={
            <Card>
              <span style={{ color: colors.muted, "font-size": font.sizeBase }}>
                Loading dictionary…
              </span>
            </Card>
          }
        >
          <div style={{ opacity: isPending() ? 0.5 : 1, transition: "opacity 0.15s" }}>
            <Card>
              <StatRow
                label="greeting"
                value={String(t("greeting", { name: name() }) ?? "")}
              />
              <Separator />
              <StatRow
                label="farewell"
                value={String(t("farewell", { name: name() }) ?? "")}
              />
              <Separator />
              <StatRow label="food.meat" value={String(t("food.meat") ?? "")} />
            </Card>
          </div>
        </Loading>
      </Container>
    );
  },
});

// ─── Story 3: Scoped & Chained Translators ────────────────────────────────────

const moduleDict = {
  nav: {
    home: "Home",
    about: "About",
    contact: "Contact",
  },
  auth: {
    login: "Log in",
    logout: "Log out",
    welcome: i18n.template<{ user: string }>("Welcome, {{ user }}!"),
  },
};

const flatModuleDict = i18n.flatten(moduleDict);

export const ScopedChainedStory = meta.story({
  name: "scopedTranslator · chainedTranslator · proxyTranslator",
  parameters: {
    docs: {
      description: {
        story:
          "`scopedTranslator(t, scope)` narrows a translator to a key prefix — useful for component-local scopes. `chainedTranslator(dict, t)` maps the dictionary shape to callable methods, enabling IDE \"Go to definition\" on translation keys. `proxyTranslator(t)` achieves the same via `Proxy` without needing the original dictionary object.",
      },
    },
  },
  render: () => {
    const [user, setUser] = createSignal("Alice");

    const t = i18n.translator(() => flatModuleDict, i18n.resolveTemplate);
    const nav = i18n.scopedTranslator(t, "nav");
    const auth = i18n.scopedTranslator(t, "auth");
    const chained = i18n.chainedTranslator(moduleDict, t);
    const proxy = i18n.proxyTranslator(t);

    return (
      <Container width={430}>
        <TextField
          label="User name — used in the welcome template"
          value={user()}
          onChange={setUser}
          placeholder="Enter name"
        />

        <Section title="scopedTranslator">
          <Card>
            <StatRow label='nav("home")' value={String(nav("home") ?? "")} />
            <Separator />
            <StatRow
              label='auth("welcome", { user })'
              value={String(auth("welcome", { user: user() }) ?? "")}
            />
          </Card>
        </Section>

        <Section title="chainedTranslator">
          <Card>
            <StatRow label="chained.nav.home()" value={chained.nav.home()} />
            <Separator />
            <StatRow
              label="chained.auth.welcome({ user })"
              value={chained.auth.welcome({ user: user() })}
            />
          </Card>
        </Section>

        <Section title="proxyTranslator">
          <Card>
            <StatRow label="proxy.nav.home()" value={proxy.nav.home()} />
            <Separator />
            <StatRow
              label="proxy.auth.welcome({ user })"
              value={proxy.auth.welcome({ user: user() })}
            />
          </Card>
        </Section>
      </Container>
    );
  },
});

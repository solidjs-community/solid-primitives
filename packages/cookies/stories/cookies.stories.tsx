import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createServerCookie,
  createUserTheme,
  getCookiesString,
  parseCookie,
} from "@solid-primitives/cookies";
import readme from "../README.md?raw";
import {
  Button,
  ButtonRow,
  Code,
  Container,
  Card,
  Section,
  StatRow,
  ValueDisplay,
  TextField,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Network/Cookies",
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

export const ThemePreferenceStory = meta.story({
  name: "Persistent Theme Preference",
  parameters: {
    docs: {
      description: {
        story:
          "`createUserTheme` returns a `Signal<'light' | 'dark' | undefined>` backed by a named cookie. The selection survives page reloads. Setting the signal to `undefined` writes a max-age=0 cookie, clearing it entirely.",
      },
    },
  },
  render: () => {
    const [theme, setTheme] = createUserTheme("sp_demo_theme");
    const isDark = () => theme() === "dark";

    return (
      <Container width={340}>
        <div
          style={{
            padding: "0.9rem 1rem",
            "border-radius": "8px",
            background: isDark() ? "#1e293b" : "#f8fafc",
            border: `1px solid ${isDark() ? "#334155" : "#e2e8f0"}`,
            display: "flex",
            gap: "0.75rem",
            "align-items": "center",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              "border-radius": "50%",
              background: isDark() ? "#f1f5f9" : "#0f172a",
              "flex-shrink": "0",
            }}
          />
          <span
            style={{
              "font-weight": "600",
              color: isDark() ? "#e2e8f0" : "#0f172a",
              "font-size": "0.9rem",
            }}
          >
            {isDark() ? "Dark" : theme() === "light" ? "Light" : "Unset"} Mode
          </span>
        </div>

        <ButtonRow>
          <Button
            onClick={() => setTheme("light")}
            variant={theme() === "light" ? "primary" : "outline"}
          >
            Light
          </Button>
          <Button
            onClick={() => setTheme("dark")}
            variant={theme() === "dark" ? "primary" : "outline"}
          >
            Dark
          </Button>
          <Button onClick={() => setTheme(undefined)} variant="ghost">
            Clear cookie
          </Button>
        </ButtonRow>

        <Section title="Signal state">
          <StatRow label="theme()" value={String(theme())} />
          <StatRow label="cookie name" value="sp_demo_theme" />
        </Section>
      </Container>
    );
  },
});

export const TypedStorageStory = meta.story({
  name: "Custom Type Serialization",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `deserialize` and `serialize` to store non-string values. The cookie is always a string on disk; the signal exposes the typed value. Here a volume level is stored as a plain number — `deserialize` converts the raw string back on read.",
      },
    },
  },
  render: () => {
    const [volume, setVolume] = createServerCookie("sp_demo_volume", {
      deserialize: str => (str != null ? Math.max(0, Math.min(100, +str)) : 50),
      serialize: String,
    });

    return (
      <Container width={340}>
        <Card>
          <div style={{ "font-size": "0.75rem", color: "#64748b" }}>
            Volume stored as <Code>number</Code> in cookie
          </div>
          <div
            style={{
              position: "relative",
              height: "8px",
              background: "#e2e8f0",
              "border-radius": "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "0",
                top: "0",
                bottom: "0",
                width: `${volume()}%`,
                background: "#6366f1",
                "border-radius": "9999px",
              }}
            />
          </div>
        </Card>

        <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
          <Button onClick={() => setVolume(v => Math.max(0, v - 10))} variant="outline">
            −
          </Button>
          <span
            style={{
              flex: "1",
              "text-align": "center",
              "font-size": "1.75rem",
              "font-weight": "700",
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {volume()}
          </span>
          <Button onClick={() => setVolume(v => Math.min(100, v + 10))} variant="outline">
            +
          </Button>
        </div>

        <Section title="Serialization">
          <StatRow label="typeof volume()" value={typeof volume()} />
          <StatRow label="stored in cookie as" value={`"${String(volume())}"`} />
          <StatRow label="cookie name" value="sp_demo_volume" />
        </Section>
      </Container>
    );
  },
});

export const CookieInspectorStory = meta.story({
  name: "Non-Reactive Inspection",
  parameters: {
    docs: {
      description: {
        story:
          "`getCookiesString()` is a one-shot read of the raw cookie string — not reactive. Pair it with `parseCookie(str, key)` to extract individual values outside a reactive context (e.g. in event handlers or server loaders). Set values with the reactive signals below, then click **Read snapshot** to inspect.",
      },
    },
  },
  render: () => {
    const [username, setUsername] = createServerCookie("sp_demo_user");
    const [lang, setLang] = createServerCookie("sp_demo_lang");
    const [snapshot, setSnapshot] = createSignal("");

    return (
      <Container width={360}>
        <Section title="Set via reactive signals">
          <TextField
            label="sp_demo_user"
            value={username() ?? ""}
            onChange={v => setUsername(v || undefined)}
            placeholder="e.g. alice"
          />
          <TextField
            label="sp_demo_lang"
            value={lang() ?? ""}
            onChange={v => setLang(v || undefined)}
            placeholder="e.g. en-US"
          />
        </Section>

        <Section title="Read with getCookiesString()">
          <Button onClick={() => setSnapshot(getCookiesString())} variant="outline">
            Read snapshot
          </Button>
          <ValueDisplay label="raw string" value={snapshot()} />
          <ValueDisplay
            label='parseCookie(str, "sp_demo_user")'
            value={parseCookie(snapshot(), "sp_demo_user") ?? "(not found)"}
          />
          <ValueDisplay
            label='parseCookie(str, "sp_demo_lang")'
            value={parseCookie(snapshot(), "sp_demo_lang") ?? "(not found)"}
          />
        </Section>
      </Container>
    );
  },
});

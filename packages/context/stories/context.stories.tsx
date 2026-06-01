import { createSignal, createContext, useContext } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createContextProvider, createLayeredContext, MultiProvider } from "@solid-primitives/context";
import readme from "../README.md?raw";
import {
  Container,
  Card,
  Button,
  ButtonRow,
  StatRow,
} from "../../../.storybook/ui/index.js";
import { colors, font, radii } from "../../../.storybook/ui/tokens.js";

const meta = preview.meta({
  title: "Control Flow/Context",
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

export const SharedState = meta.story({
  name: "Two consumers, one signal",
  parameters: {
    docs: {
      description: {
        story:
          "`createContextProvider` distributes a single reactive counter to any descendant that calls `useCounter()`. Both cards share the same signal instance — incrementing in either consumer updates both.",
      },
    },
  },
  render: () => {
    const [CounterProvider, useCounter] = createContextProvider(() => {
      const [count, setCount] = createSignal(0);
      return {
        count,
        increment: () => setCount(c => c + 1),
        reset: () => setCount(0),
      };
    });

    const Consumer = (props: { label: string }) => {
      const ctx = useCounter()!;
      return (
        <Card>
          <div style={{ "font-size": font.sizeSm, color: colors.muted }}>{props.label}</div>
          <StatRow label="count" value={ctx.count()} />
          <Button variant="secondary" onClick={() => ctx.increment()}>
            Increment
          </Button>
        </Card>
      );
    };

    const Reset = () => {
      const ctx = useCounter()!;
      return (
        <Button variant="ghost" onClick={() => ctx.reset()}>
          Reset all
        </Button>
      );
    };

    return (
      <CounterProvider>
        <Container width={280}>
          <h3 style={{ margin: 0 }}>Shared counter</h3>
          <Consumer label="Consumer A" />
          <Consumer label="Consumer B" />
          <Reset />
        </Container>
      </CounterProvider>
    );
  },
});

export const FallbackValue = meta.story({
  name: "Fallback outside provider",
  parameters: {
    docs: {
      description: {
        story:
          "Passing defaults to `createContextProvider` makes the hook safe to call outside any provider — it returns the fallback instead of throwing. Toggle between the two modes to compare the live factory value against the default.",
      },
    },
  },
  render: () => {
    const [UserProvider, useUser] = createContextProvider(
      (props: { name: string; role: string }) => ({ name: props.name, role: props.role }),
      { name: "Guest", role: "visitor" },
    );

    const [inside, setInside] = createSignal(true);

    const UserDisplay = () => {
      const user = useUser();
      return (
        <>
          <StatRow label="name" value={user.name} />
          <StatRow label="role" value={user.role} />
        </>
      );
    };

    return (
      <Container width={300}>
        <h3 style={{ margin: 0 }}>Context fallback</h3>
        <ButtonRow>
          <Button variant={inside() ? "primary" : "outline"} onClick={() => setInside(true)}>
            Inside provider
          </Button>
          <Button variant={!inside() ? "primary" : "outline"} onClick={() => setInside(false)}>
            No provider
          </Button>
        </ButtonRow>
        <Card>
          {inside() ? (
            <UserProvider name="Alice" role="admin">
              <UserDisplay />
            </UserProvider>
          ) : (
            <UserDisplay />
          )}
        </Card>
        <p style={{ "font-size": font.sizeSm, color: colors.muted, margin: 0 }}>
          {inside()
            ? "Provider active — factory result returned."
            : "No provider — fallback defaults returned."}
        </p>
      </Container>
    );
  },
});

export const LayeredOverrides = meta.story({
  name: "Incremental theme overrides",
  parameters: {
    docs: {
      description: {
        story:
          "`createLayeredContext` calls the factory with the nearest parent's value, so each nested provider can selectively override specific properties. Unset props are inherited from above — no need to forward every key manually.",
      },
    },
  },
  render: () => {
    const [ThemeProvider, useTheme] = createLayeredContext(
      (props: { accent?: string; scale?: string }, parent) => ({
        accent: props.accent ?? parent.accent,
        scale: props.scale ?? parent.scale,
      }),
      { accent: "indigo", scale: "sm" },
    );

    const palette: Record<string, { bg: string; fg: string }> = {
      indigo: { bg: "#e0e7ff", fg: "#3730a3" },
      emerald: { bg: "#d1fae5", fg: "#065f46" },
      rose: { bg: "#ffe4e6", fg: "#9f1239" },
    };

    const ThemeDisplay = (props: { depth: string }) => {
      const theme = useTheme();
      const c = palette[theme.accent] ?? palette.indigo;
      return (
        <div
          style={{
            padding: "0.45rem 0.75rem",
            background: c.bg,
            "border-radius": radii.md,
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}
        >
          <span style={{ "font-weight": "600", color: c.fg, "font-size": font.sizeSm }}>
            {props.depth}
          </span>
          <span style={{ "font-family": font.mono, "font-size": font.sizeSm, color: c.fg, opacity: "0.75" }}>
            accent={theme.accent} · scale={theme.scale}
          </span>
        </div>
      );
    };

    return (
      <ThemeProvider>
        <Container width={420}>
          <h3 style={{ margin: 0 }}>Layered theme</h3>
          <ThemeDisplay depth="Root" />
          <div style={{ "padding-left": "1rem", display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
            <ThemeProvider accent="emerald">
              <ThemeDisplay depth="↳ Level 1 — accent override" />
              <div style={{ "padding-left": "1rem", display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
                <ThemeProvider scale="lg">
                  <ThemeDisplay depth="↳↳ Level 2 — scale override" />
                  <div style={{ "padding-left": "1rem" }}>
                    <ThemeProvider accent="rose">
                      <ThemeDisplay depth="↳↳↳ Level 3 — accent override" />
                    </ThemeProvider>
                  </div>
                </ThemeProvider>
              </div>
            </ThemeProvider>
          </div>
          <p style={{ "font-size": font.sizeSm, color: colors.muted, margin: 0 }}>
            Each level inherits what it doesn't override — no manual prop forwarding.
          </p>
        </Container>
      </ThemeProvider>
    );
  },
});

export const FlatProviderTree = meta.story({
  name: "Flat multi-context setup",
  parameters: {
    docs: {
      description: {
        story:
          "`MultiProvider` accepts an array of `[context, value]` tuples and renders them as if they were deeply nested — keeping the JSX tree flat without any loss of context behaviour.",
      },
    },
  },
  render: () => {
    const ThemeCtx = createContext({ mode: "light", accent: "blue" });
    const UserCtx = createContext({ name: "Guest", role: "visitor" });
    const LocaleCtx = createContext({ lang: "en", dir: "ltr" });

    const Summary = () => {
      const theme = useContext(ThemeCtx);
      const user = useContext(UserCtx);
      const locale = useContext(LocaleCtx);
      return (
        <>
          <StatRow label="theme.mode" value={theme.mode} />
          <StatRow label="theme.accent" value={theme.accent} />
          <StatRow label="user.name" value={user.name} />
          <StatRow label="user.role" value={user.role} />
          <StatRow label="locale.lang" value={locale.lang} />
          <StatRow label="locale.dir" value={locale.dir} />
        </>
      );
    };

    return (
      <Container width={320}>
        <h3 style={{ margin: 0 }}>MultiProvider</h3>
        <MultiProvider
          values={[
            [ThemeCtx, { mode: "dark", accent: "violet" }],
            [UserCtx, { name: "Alice", role: "admin" }],
            [LocaleCtx, { lang: "fr", dir: "ltr" }],
          ]}
        >
          <Card>
            <Summary />
          </Card>
        </MultiProvider>
      </Container>
    );
  },
});

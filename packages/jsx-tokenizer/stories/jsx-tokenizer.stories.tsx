import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createTokenizer,
  createToken,
  resolveTokens,
  isToken,
} from "@solid-primitives/jsx-tokenizer";
import readme from "../README.md?raw";
import {
  Container,
  Card,
  Button,
  ButtonRow,
  Kbd,
  Badge,
  colors,
  font,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Control Flow/JSX Tokenizer",
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

type TabData = { id: string; label: string };
const TabTokenizer = createTokenizer<TabData>({ name: "tabs" });
const Tab = createToken(
  TabTokenizer,
  (props: TabData) => props,
  props => <span>{props.label}</span>,
);

const PANELS: Record<string, string> = {
  overview: "High-level summary of the project state and recent metrics.",
  settings: "Configure preferences, integrations, and notification rules.",
  activity: "A chronological feed of recent changes and automated events.",
};

export const TabBarFromTokens = meta.story({
  name: "Tab bar from token children",
  parameters: {
    docs: {
      description: {
        story:
          "`resolveTokens` extracts `<Tab>` data from children without rendering them. The parent builds the tab bar entirely from `token.data` — children declare labels only, the parent controls the layout and active state.",
      },
    },
  },
  render: () => {
    const [active, setActive] = createSignal("overview");

    const tokens = resolveTokens(TabTokenizer, () => (
      <>
        <Tab id="overview" label="Overview" />
        <Tab id="settings" label="Settings" />
        <Tab id="activity" label="Activity" />
      </>
    ));

    return (
      <Container width={380}>
        <div style={{ display: "flex", "border-bottom": `1px solid ${colors.border}` }}>
          <For each={tokens()}>
            {token => (
              <button
                onClick={() => setActive(token.data.id)}
                style={{
                  padding: "0.45rem 0.9rem",
                  border: "none",
                  background: "transparent",
                  "border-bottom":
                    active() === token.data.id
                      ? `2px solid ${colors.primary}`
                      : "2px solid transparent",
                  "margin-bottom": "-1px",
                  color: active() === token.data.id ? colors.primary : colors.muted,
                  cursor: "pointer",
                  "font-size": font.sizeBase,
                  "font-family": font.system,
                  "font-weight": active() === token.data.id ? "600" : "400",
                  transition: "color 0.15s",
                }}
              >
                {token.data.label}
              </button>
            )}
          </For>
        </div>

        <Card>
          <p style={{ margin: 0, "font-size": font.sizeBase, color: colors.secondaryFg }}>
            {PANELS[active()] ?? ""}
          </p>
        </Card>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
          The parent reads <code>token.data</code> to render — children are never mounted as DOM.
        </p>
      </Container>
    );
  },
});

type CrumbData = { label: string; href?: string };
const Crumb = createToken(
  (props: CrumbData) => props,
  props => <a href={props.href ?? "#"}>{props.label}</a>,
);

const PATHS = [
  ["Home"],
  ["Home", "Projects"],
  ["Home", "Projects", "Solid Primitives"],
  ["Home", "Projects", "Solid Primitives", "jsx-tokenizer"],
];

export const StandaloneToken = meta.story({
  name: "Standalone token (no tokenizer)",
  parameters: {
    docs: {
      description: {
        story:
          "`createToken` without a tokenizer argument creates its own identity. The token component can then be passed directly to `resolveTokens` as the tokenizer — no separate `createTokenizer` call needed.",
      },
    },
  },
  render: () => {
    const [depth, setDepth] = createSignal(2);
    const crumbs = () => PATHS[depth()] ?? [];

    const tokens = resolveTokens(Crumb, () => (
      <For each={crumbs()}>
        {(label, i) => <Crumb label={label} href={i() === crumbs().length - 1 ? undefined : "#"} />}
      </For>
    ));

    return (
      <Container width={380}>
        <h4 style={{ margin: 0, "font-size": font.sizeBase, color: colors.secondaryFg }}>
          Breadcrumb
        </h4>

        <Card>
          <div
            style={{
              display: "flex",
              "align-items": "center",
              gap: "0.35rem",
              "flex-wrap": "wrap",
            }}
          >
            <For each={tokens()}>
              {(token, i) => (
                <>
                  <Show when={i() > 0}>
                    <span style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>/</span>
                  </Show>
                  <span
                    style={{
                      "font-size": font.sizeBase,
                      color: i() === tokens().length - 1 ? colors.dark : colors.primary,
                      "font-weight": i() === tokens().length - 1 ? "600" : "400",
                      cursor: i() < tokens().length - 1 ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (i() < tokens().length - 1) setDepth(i());
                    }}
                  >
                    {token.data.label}
                  </span>
                </>
              )}
            </For>
          </div>
        </Card>

        <ButtonRow>
          <Button
            variant="outline"
            disabled={depth() === 0}
            onClick={() => setDepth(d => Math.max(0, d - 1))}
          >
            ← Back
          </Button>
          <Button
            variant="outline"
            disabled={depth() === PATHS.length - 1}
            onClick={() => setDepth(d => Math.min(PATHS.length - 1, d + 1))}
          >
            Navigate deeper →
          </Button>
        </ButtonRow>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
          <code>Crumb</code> is the tokenizer — no separate <code>createTokenizer</code> call.
        </p>
      </Container>
    );
  },
});

type CalloutData = { kind: "info" | "tip" | "warning"; text: string };
const CalloutTokenizer = createTokenizer<CalloutData>({ name: "callout" });
const Callout = createToken(
  CalloutTokenizer,
  (props: CalloutData) => ({ kind: props.kind, text: props.text }),
  props => <blockquote>{props.text}</blockquote>,
);

const CALLOUT_STYLE: Record<
  CalloutData["kind"],
  { bg: string; border: string; color: string; label: string }
> = {
  info: { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8", label: "Info" },
  tip: { bg: "#f0fdf4", border: "#86efac", color: "#15803d", label: "Tip" },
  warning: { bg: "#fffbeb", border: "#fcd34d", color: "#b45309", label: "Warning" },
};

export const MixedTokensAndJSX = meta.story({
  name: "Tokens mixed with plain JSX",
  parameters: {
    docs: {
      description: {
        story:
          "With `{ includeJSXElements: true }`, `resolveTokens` collects both tokens and regular JSX. Use `isToken` to narrow each item: tokens get the styled callout treatment, everything else renders as plain prose.",
      },
    },
  },
  render: () => {
    const items = resolveTokens(
      CalloutTokenizer,
      () => (
        <>
          <p>
            This component resolves children with <code>includeJSXElements: true</code>.
          </p>
          <Callout kind="info" text="Token children are intercepted before rendering." />
          <p>Plain JSX passes through and renders as-is.</p>
          <Callout kind="tip" text="Use isToken() to tell tokens apart from regular elements." />
          <Callout
            kind="warning"
            text="Context injected above resolveTokens won't reach token data functions."
          />
        </>
      ),
      { includeJSXElements: true },
    );

    return (
      <Container width={400}>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.4rem" }}>
          <For each={items()}>
            {item => {
              if (isToken(CalloutTokenizer, item)) {
                const s = CALLOUT_STYLE[item.data.kind];
                return (
                  <div
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      "border-radius": radii.md,
                      padding: "0.4rem 0.65rem",
                      display: "flex",
                      gap: "0.4rem",
                      "align-items": "baseline",
                    }}
                  >
                    <Badge
                      variant={
                        item.data.kind === "warning"
                          ? "warning"
                          : item.data.kind === "tip"
                            ? "success"
                            : "info"
                      }
                    >
                      {s.label}
                    </Badge>
                    <span style={{ "font-size": font.sizeBase, color: s.color }}>
                      {item.data.text}
                    </span>
                  </div>
                );
              }
              return (
                <div style={{ "font-size": font.sizeBase, color: colors.secondaryFg }}>
                  {item as any}
                </div>
              );
            }}
          </For>
        </div>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
          Tokens are intercepted; plain JSX passes through unchanged.
        </p>
      </Container>
    );
  },
});

type ActionData = { label: string; kbd?: string; description?: string; danger?: boolean };
const ActionTokenizer = createTokenizer<ActionData>({ name: "action" });
const Action = createToken(
  ActionTokenizer,
  (props: ActionData) => ({
    label: props.label,
    kbd: props.kbd,
    description: props.description,
    danger: props.danger,
  }),
  props => <div>{props.label}</div>,
);

const Div = createToken(
  (_props: {}) => ({}),
  () => <hr />,
);

export const MultipleTokenizers = meta.story({
  name: "Resolving two token families",
  parameters: {
    docs: {
      description: {
        story:
          "Pass an array to `resolveTokens` to collect tokens from multiple tokenizers in a single pass. Use `isToken` on each tokenizer to narrow which kind of token you're rendering.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<string[]>([]);
    const push = (msg: string) => setLog(l => [msg, ...l].slice(0, 4));

    const tokens = resolveTokens([ActionTokenizer, Div], () => (
      <>
        <Action label="New file" kbd="⌘N" description="Create a blank document" />
        <Action label="Open…" kbd="⌘O" description="Browse and open a file" />
        <Action label="Save" kbd="⌘S" description="Save the current document" />
        <Div />
        <Action label="Share…" description="Invite collaborators" />
        <Action label="Export as PDF" description="Download a PDF copy" />
        <Div />
        <Action label="Delete" description="Permanently remove this file" danger />
      </>
    ));

    return (
      <Container width={340}>
        <div
          style={{
            border: `1px solid ${colors.border}`,
            "border-radius": radii.lg,
            overflow: "hidden",
          }}
        >
          <For each={tokens()}>
            {token => {
              if (isToken(Div, token)) {
                return <div style={{ height: "1px", background: colors.border }} />;
              }
              if (isToken(ActionTokenizer, token)) {
                const d = token.data;
                return (
                  <button
                    onClick={() => push(d.label)}
                    style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "0.5rem",
                      width: "100%",
                      padding: "0.45rem 0.75rem",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      "text-align": "left",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = colors.surface;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        "font-size": font.sizeBase,
                        color: d.danger ? "#dc2626" : colors.dark,
                        "font-family": font.system,
                      }}
                    >
                      {d.label}
                    </span>
                    <Show when={d.kbd}>{kbd => <Kbd>{kbd()}</Kbd>}</Show>
                  </button>
                );
              }
              return null;
            }}
          </For>
        </div>

        <Show when={log().length > 0}>
          <div
            style={{
              background: colors.dark,
              "border-radius": radii.md,
              padding: "0.45rem 0.65rem",
            }}
          >
            <div
              style={{
                "font-size": font.sizeSm,
                color: colors.mutedFg,
                "margin-bottom": "0.25rem",
              }}
            >
              Last triggered:
            </div>
            <For each={log()}>
              {(entry, i) => (
                <div
                  style={{
                    "font-size": font.sizeSm,
                    "font-family": font.mono,
                    color: i() === 0 ? colors.darkFg : colors.mutedFg,
                  }}
                >
                  {entry}
                </div>
              )}
            </For>
          </div>
        </Show>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
          <code>Action</code> and <code>Div</code> tokens are distinct families, resolved in one
          pass.
        </p>
      </Container>
    );
  },
});

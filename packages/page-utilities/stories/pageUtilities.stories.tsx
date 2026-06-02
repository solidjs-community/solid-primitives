import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createPageLeaveBlocker,
  createPageVisibility,
  makePageLeave,
  usePageVisibility,
} from "../src/index.js";
import readme from "../README.md?raw";
import {
  Alert,
  Badge,
  BoolRow,
  Button,
  Card,
  colors,
  Container,
  EventLog,
  font,
  TextField,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Display & Media/Page Utilities",
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

export const VisibilitySignalStory = meta.story({
  name: "Visibility signal",
  parameters: {
    docs: {
      description: {
        story:
          "`createPageVisibility()` returns a reactive boolean — `true` when the page is in the foreground, `false` when the tab is hidden or minimised. Switch to another tab or minimise the browser window to see the signal flip and the log update.",
      },
    },
  },
  render: () => {
    const visible = createPageVisibility();
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    createEffect(
      () => visible(),
      v => {
        setLog(prev =>
          [
            { label: v ? "→ visible" : "→ hidden", time: new Date().toLocaleTimeString() },
            ...prev,
          ].slice(0, 5),
        );
      },
    );

    return (
      <Container width={300}>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}
        >
          <span style={{ "font-size": font.sizeBase, color: colors.muted }}>Page state</span>
          <Badge variant={visible() ? "success" : "warning"}>
            {visible() ? "visible" : "hidden"}
          </Badge>
        </div>
        <BoolRow label="visible()" value={visible()} />
        <EventLog entries={log()} />
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          Switch tabs or minimise this window to see the signal update.
        </p>
      </Container>
    );
  },
});

export const SingletonRootStory = meta.story({
  name: "Singleton shared by two components",
  parameters: {
    docs: {
      description: {
        story:
          "`usePageVisibility()` is a [singleton root](https://primitives.solidjs.community/package/rootless) — no matter how many components call it, only one event listener is registered. Both cards below call `usePageVisibility()` independently yet they share the exact same underlying signal.",
      },
    },
  },
  render: () => {
    const visibleA = usePageVisibility();
    const visibleB = usePageVisibility();

    return (
      <Container width={300}>
        <Card>
          <span
            style={{ "font-size": font.sizeSm, color: colors.muted, "font-family": font.mono }}
          >
            Component A
          </span>
          <BoolRow label="usePageVisibility()" value={visibleA()} />
        </Card>
        <Card>
          <span
            style={{ "font-size": font.sizeSm, color: colors.muted, "font-family": font.mono }}
          >
            Component B
          </span>
          <BoolRow label="usePageVisibility()" value={visibleB()} />
        </Card>
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          Both share one listener. Switch tabs to see both update at once.
        </p>
      </Container>
    );
  },
});

export const UnsavedChangesGuardStory = meta.story({
  name: "Unsaved-changes guard",
  parameters: {
    docs: {
      description: {
        story:
          "`createPageLeaveBlocker(enabled)` accepts a reactive accessor. When the accessor returns `true` a `beforeunload` listener is added, prompting the user before they close or navigate away. Type anything to make the form dirty — then try refreshing the page.",
      },
    },
  },
  render: () => {
    const [value, setValue] = createSignal("");
    const isDirty = () => value() !== "";

    createPageLeaveBlocker(isDirty);

    return (
      <Container width={320}>
        <TextField
          label="Draft note"
          value={value()}
          onChange={setValue}
          placeholder="Type to mark as dirty…"
        />
        <BoolRow label="isDirty" value={isDirty()} />
        <Show when={isDirty()}>
          <Alert variant="warning">Navigation is blocked — try refreshing the page.</Alert>
        </Show>
        <Button onClick={() => setValue("")} variant="outline" disabled={!isDirty()}>
          Discard changes
        </Button>
      </Container>
    );
  },
});

export const ImperativeLeaveGuardStory = meta.story({
  name: "Imperative leave guard",
  parameters: {
    docs: {
      description: {
        story:
          "`makePageLeave()` attaches a `beforeunload` listener immediately and returns a cleanup function to remove it. Toggle the guard on and off — while active, closing the tab or refreshing will trigger the browser's confirmation dialog.",
      },
    },
  },
  render: () => {
    const [active, setActive] = createSignal(false);
    let cleanup: (() => void) | undefined;

    const toggle = () => {
      if (active()) {
        cleanup?.();
        cleanup = undefined;
        setActive(false);
      } else {
        cleanup = makePageLeave();
        setActive(true);
      }
    };

    onCleanup(() => cleanup?.());

    return (
      <Container width={280}>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}
        >
          <span style={{ "font-size": font.sizeBase, color: colors.muted }}>Leave guard</span>
          <Badge variant={active() ? "error" : "default"}>
            {active() ? "active" : "inactive"}
          </Badge>
        </div>
        <Button onClick={toggle} variant={active() ? "outline" : "primary"}>
          {active() ? "Remove guard" : "Add guard"}
        </Button>
        <Show when={active()}>
          <Alert variant="warning">
            Guard is active — try closing or refreshing this tab.
          </Alert>
        </Show>
      </Container>
    );
  },
});

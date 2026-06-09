import { createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  isNotificationSupported,
  makeNotification,
  createNotification,
  createNotificationPermission,
} from "@solid-primitives/notification";
import readme from "../README.md?raw";
import {
  Alert,
  Badge,
  Button,
  ButtonRow,
  Container,
  EventLog,
  Section,
  StatRow,
  BoolRow,
  TextField,
  colors,
  font,
} from "../../../.storybook/ui/index.js";

function ts() {
  return new Date().toLocaleTimeString();
}

function permBadge(state: string): "success" | "error" | "warning" | "default" {
  return state === "granted"
    ? "success"
    : state === "denied"
      ? "error"
      : state === "prompt" || state === "default"
        ? "warning"
        : "default";
}

/** Opens this story's canvas URL in a new tab where it becomes a top-level page.
 *  Necessary because Chrome blocks Notification.requestPermission() inside iframes. */
const openInTab = () => window.open(window.location.href, "_blank");

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = preview.meta({
  title: "Browser APIs/Notification",
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

// ─── createNotificationPermission ────────────────────────────────────────────

export const PermissionFlow = meta.story({
  name: "Request & live permission state",
  parameters: {
    docs: {
      description: {
        story:
          "`createNotificationPermission()` wraps the browser [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API). `permission()` starts as `\"unknown\"` while the async query resolves, then settles to `\"granted\"`, `\"denied\"`, or `\"prompt\"`. The signal updates live whenever the user changes their browser settings — no polling required. `pending()` is `true` while the native browser dialog is open.",
      },
    },
  },
  render: () => {
    const { permission, requestPermission, pending } = createNotificationPermission();
    const [reqError, setReqError] = createSignal<string | null>(null);

    const handleRequest = () => {
      setReqError(null);
      requestPermission().catch((err: unknown) => {
        setReqError(err instanceof Error ? err.message : "Permission request blocked by browser");
      });
    };

    return (
      <Container width={340}>
        <Show
          when={isNotificationSupported()}
          fallback={
            <Alert variant="warning">Notifications API not supported in this browser.</Alert>
          }
        >
          <Section title="permission()">
            <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
              <Badge variant={permBadge(permission())}>{permission()}</Badge>
              <span style={{ color: colors.muted, "font-size": font.sizeSm }}>
                {permission() === "unknown"
                  ? "resolving…"
                  : permission() === "prompt"
                    ? "not yet asked"
                    : permission() === "granted"
                      ? "notifications allowed"
                      : "blocked — change in browser settings"}
              </span>
            </div>
          </Section>

          <Section title="pending()">
            <BoolRow label="dialog open" value={pending()} />
          </Section>

          <Show when={reqError() !== null}>
            <Alert variant="error">{reqError()!} — try opening in a new tab.</Alert>
          </Show>

          <ButtonRow>
            <Button
              onClick={handleRequest}
              disabled={permission() === "granted" || permission() === "denied" || pending()}
            >
              {pending() ? "Requesting…" : "Request permission"}
            </Button>
            <Button onClick={openInTab} variant="outline">
              Open in new tab ↗
            </Button>
          </ButtonRow>

          <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
            If the browser dialog doesn't appear, click <strong>Open in new tab ↗</strong> —
            Chrome blocks permission prompts inside embedded iframes. The badge updates live when
            you change settings without reloading.
          </p>
        </Show>
      </Container>
    );
  },
});

// ─── createNotification ───────────────────────────────────────────────────────

export const ReactiveInstance = meta.story({
  name: "Reactive instance & events",
  parameters: {
    docs: {
      description: {
        story:
          "`createNotification` tracks the live `Notification` object in `notification()` — `null` while idle, the instance while visible. The signal clears automatically when the OS dismisses the notification. `title` and `options` can be plain values or reactive accessors; their current values are read each time `show()` is called. Event handlers (`onClick`, `onClose`, `onError`) fire on native notification events.",
      },
    },
  },
  render: () => {
    const [body, setBody] = createSignal("Hello from Storybook!");
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);
    const push = (label: string) =>
      setLog(prev => [{ label, time: ts() }, ...prev].slice(0, 6));

    const { permission, requestPermission, pending } = createNotificationPermission();
    const [reqError, setReqError] = createSignal<string | null>(null);
    const handleRequest = () => {
      setReqError(null);
      requestPermission().catch((err: unknown) => {
        setReqError(err instanceof Error ? err.message : "Permission request blocked by browser");
      });
    };

    const { show, close, notification, supported } = createNotification(
      "Solid Primitives",
      () => ({ body: body() }),
      {
        onClick: () => push("onClick"),
        onClose: () => push("onClose"),
        onError: () => push("onError"),
      },
    );

    return (
      <Container width={340}>
        <Show
          when={supported}
          fallback={<Alert variant="warning">Notifications API not supported.</Alert>}
        >
          <Section title="Permission">
            <div style={{ display: "flex", "align-items": "center", gap: "0.6rem" }}>
              <Badge variant={permBadge(permission())}>{permission()}</Badge>
              <Show when={permission() !== "granted" && permission() !== "denied"}>
                <Button
                  onClick={handleRequest}
                  disabled={pending()}
                  variant="outline"
                  style={{ "font-size": font.sizeSm, padding: "0.25rem 0.6rem" }}
                >
                  {pending() ? "Requesting…" : "Request"}
                </Button>
              </Show>
              <Button
                onClick={openInTab}
                variant="ghost"
                style={{ "font-size": font.sizeSm, padding: "0.25rem 0.6rem", "margin-left": "auto" }}
              >
                Open in new tab ↗
              </Button>
            </div>
          </Section>

          <Show when={reqError() !== null}>
            <Alert variant="error">{reqError()!} — try opening in a new tab.</Alert>
          </Show>

          <Show when={permission() === "denied"}>
            <Alert variant="error">
              Permission denied — grant it in browser settings and reload.
            </Alert>
          </Show>

          <TextField
            label="Notification body"
            value={body()}
            onChange={setBody}
            placeholder="Message text…"
          />

          <Section title="notification()">
            <BoolRow label="active" value={notification() !== null} />
            <Show when={notification() !== null}>
              <StatRow label="title" value={notification()!.title} />
            </Show>
          </Section>

          <ButtonRow>
            <Button onClick={() => show()} disabled={permission() !== "granted"}>
              Show
            </Button>
            <Button onClick={close} disabled={notification() === null} variant="outline">
              Close
            </Button>
          </ButtonRow>

          <Section title="Event log">
            <EventLog entries={log()} />
          </Section>

          <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
            Change the body text before clicking Show — options are read at call time. Click the
            OS notification to fire <code>onClick</code>; dismissing it fires <code>onClose</code>.
          </p>
        </Show>
      </Container>
    );
  },
});

// ─── makeNotification ─────────────────────────────────────────────────────────

export const ImperativeAPI = meta.story({
  name: "Imperative show & close",
  parameters: {
    docs: {
      description: {
        story:
          "`makeNotification(title, options?)` has no Solid lifecycle dependency — it returns a plain `[show, close]` tuple. `show()` creates the native notification and returns the `Notification` instance, or `null` when permission is not `\"granted\"`. Permission must be managed separately; here `createNotificationPermission` provides the reactive permission badge and inline Request button.",
      },
    },
  },
  render: () => {
    const [result, setResult] = createSignal<string>("—");
    const [show, close] = makeNotification("makeNotification demo", {
      body: "Imperative — no Solid lifecycle",
    });
    const { permission, requestPermission, pending } = createNotificationPermission();
    const [reqError, setReqError] = createSignal<string | null>(null);

    const handleRequest = () => {
      setReqError(null);
      requestPermission().catch((err: unknown) => {
        setReqError(err instanceof Error ? err.message : "Permission request blocked by browser");
      });
    };

    const handleShow = () => {
      const n = show();
      setResult(n ? `Notification { title: "${n.title}" }` : "null");
    };

    const handleClose = () => {
      close();
      setResult("—");
    };

    return (
      <Container width={340}>
        <Show
          when={isNotificationSupported()}
          fallback={<Alert variant="warning">Notifications API not supported.</Alert>}
        >
          <Section title="Permission">
            <div style={{ display: "flex", "align-items": "center", gap: "0.6rem" }}>
              <Badge variant={permBadge(permission())}>{permission()}</Badge>
              <Show when={permission() !== "granted" && permission() !== "denied"}>
                <Button
                  onClick={handleRequest}
                  disabled={pending()}
                  variant="outline"
                  style={{ "font-size": font.sizeSm, padding: "0.25rem 0.6rem" }}
                >
                  {pending() ? "Requesting…" : "Request"}
                </Button>
              </Show>
              <Button
                onClick={openInTab}
                variant="ghost"
                style={{ "font-size": font.sizeSm, padding: "0.25rem 0.6rem", "margin-left": "auto" }}
              >
                Open in new tab ↗
              </Button>
            </div>
          </Section>

          <Show when={reqError() !== null}>
            <Alert variant="error">{reqError()!} — try opening in a new tab.</Alert>
          </Show>

          <Section title="show() return value">
            <code
              style={{
                "font-family": font.mono,
                "font-size": font.sizeSm,
                color: result().startsWith("Notification") ? colors.success : colors.muted,
              }}
            >
              {result()}
            </code>
          </Section>

          <ButtonRow>
            <Button onClick={handleShow} disabled={permission() !== "granted"}>
              show()
            </Button>
            <Button onClick={handleClose} variant="outline">
              close()
            </Button>
          </ButtonRow>

          <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
            <code>show()</code> calls <code>new Notification()</code> directly — a real OS
            notification, not a mock. If the Request button doesn't trigger a browser dialog,
            use <strong>Open in new tab ↗</strong> to escape the iframe.
          </p>
        </Show>
      </Container>
    );
  },
});

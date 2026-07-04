import { createSignal, Errored, Loading } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createSSE,
  json,
  SSEReadyState,
  type SSESourceFn,
  type SSESourceHandle,
} from "@solid-primitives/sse";
import readme from "../README.md?raw";
import {
  Alert,
  Badge,
  Button,
  ButtonRow,
  Card,
  colors,
  Container,
  EventLog,
  font,
  StatRow,
} from "../../../.storybook/ui/index.js";

// ─── Mock SSE source factories (no server required) ───────────────────────────

function buildHandle() {
  let rs: number = SSEReadyState.CONNECTING;
  const source = {
    get readyState() {
      return rs;
    },
    close() {
      rs = SSEReadyState.CLOSED;
    },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  } as unknown as SSESourceHandle;
  return {
    source,
    setRs: (v: number) => {
      rs = v;
    },
  };
}

/** Emits `messages` in round-robin on `interval` ms after `openDelay`. */
const makePeriodicMock = (messages: string[], interval = 2000, openDelay = 600): SSESourceFn => {
  return (_url, options) => {
    const { source, setRs } = buildHandle();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let msgInterval: ReturnType<typeof setInterval> | undefined;
    let closed = false;
    let i = 0;

    timers.push(
      setTimeout(() => {
        if (closed) return;
        setRs(SSEReadyState.OPEN);
        options.onOpen?.(new Event("open"));
        msgInterval = setInterval(() => {
          if (closed) return;
          options.onMessage?.(
            new MessageEvent("message", { data: messages[i++ % messages.length] }),
          );
        }, interval);
      }, openDelay),
    );

    return [
      source,
      () => {
        closed = true;
        setRs(SSEReadyState.CLOSED);
        timers.forEach(clearTimeout);
        if (msgInterval !== undefined) clearInterval(msgInterval);
      },
    ];
  };
};

/** Opens, sends `msgCount` messages, then fires a terminal error after `failAfterMs`. */
const makeFailingMock = (failAfterMs = 3000, msgCount = 2): SSESourceFn => {
  return (_url, options) => {
    const { source, setRs } = buildHandle();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let closed = false;

    timers.push(
      setTimeout(() => {
        if (closed) return;
        setRs(SSEReadyState.OPEN);
        options.onOpen?.(new Event("open"));

        for (let i = 0; i < msgCount; i++) {
          timers.push(
            setTimeout(
              () => {
                if (!closed)
                  options.onMessage?.(new MessageEvent("message", { data: `message ${i + 1}` }));
              },
              (i + 1) * 700,
            ),
          );
        }

        timers.push(
          setTimeout(() => {
            if (closed) return;
            setRs(SSEReadyState.CLOSED);
            options.onError?.({ target: source, type: "error" } as unknown as Event);
          }, failAfterMs),
        );
      }, 400),
    );

    return [
      source,
      () => {
        closed = true;
        setRs(SSEReadyState.CLOSED);
        timers.forEach(clearTimeout);
      },
    ];
  };
};

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = preview.meta({
  title: "Network/SSE",
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

// ─── Shared display helpers ───────────────────────────────────────────────────

const STATE_LABEL = ["connecting", "open", "closed"] as const;
const STATE_VARIANT = ["info", "success", "error"] as const;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const StreamWithControlsStory = meta.story({
  name: "Reactive stream with state & controls",
  parameters: {
    docs: {
      description: {
        story:
          "`createSSE` returns `data`, `readyState`, `close`, and `reconnect`. `readyState` tracks the connection phase (`CONNECTING → OPEN → CLOSED`). `close()` stops the stream; `reconnect()` force-reopens it and resets `data` to pending until the next message arrives. This demo uses a simulated source emitting a new reading every 2 seconds — no real server required.",
      },
    },
  },
  render: () => {
    const MESSAGES = [
      "temp: 21 °C",
      "humidity: 55 %",
      "pressure: 1013 hPa",
      "UV: 3",
      "wind: 12 km/h NW",
    ];

    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    const { data, readyState, close, reconnect } = createSSE<string>("mock://sensor", {
      source: makePeriodicMock(MESSAGES, 2000),
      initialValue: "—",
      onMessage: e =>
        setLog(prev =>
          [{ label: e.data, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5),
        ),
    });

    return (
      <Container width={300}>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}
        >
          <span style={{ "font-size": font.sizeBase, color: colors.muted }}>readyState</span>
          <Badge variant={STATE_VARIANT[readyState()]}>{STATE_LABEL[readyState()]}</Badge>
        </div>
        <StatRow label="data()" value={data()} />
        <ButtonRow>
          <Button
            onClick={close}
            variant="outline"
            disabled={readyState() === SSEReadyState.CLOSED}
            style={{ flex: "1" }}
          >
            close
          </Button>
          <Button onClick={reconnect} variant="outline" style={{ flex: "1" }}>
            reconnect
          </Button>
        </ButtonRow>
        <EventLog entries={log()} />
      </Container>
    );
  },
});

export const BoundaryStory = meta.story({
  name: "Loading + Errored boundaries",
  parameters: {
    docs: {
      description: {
        story:
          "`data()` is pending (throws `NotReadyError`) until the first message arrives — `<Loading>` catches that and shows a fallback. Terminal errors (connection CLOSED, no retries left) are thrown through `data()` so `<Errored>` catches them without extra wiring. This demo connects, sends two messages, then simulates a terminal disconnect after ~3 s.",
      },
    },
  },
  render: () => {
    const { data, readyState, reconnect } = createSSE<string>("mock://failing", {
      source: makeFailingMock(3000, 2),
    });

    return (
      <Container width={300}>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}
        >
          <span style={{ "font-size": font.sizeBase, color: colors.muted }}>readyState</span>
          <Badge variant={STATE_VARIANT[readyState()]}>{STATE_LABEL[readyState()]}</Badge>
        </div>
        <Errored
          fallback={_err => (
            <Card>
              <Alert variant="error">Connection lost — terminal error</Alert>
              <Button onClick={reconnect} style={{ width: "100%" }}>
                Reconnect
              </Button>
            </Card>
          )}
        >
          <Loading
            fallback={
              <div
                style={{
                  color: colors.muted,
                  "font-size": font.sizeBase,
                  padding: "0.25rem 0",
                }}
              >
                Connecting…
              </div>
            }
          >
            <StatRow label="data()" value={String(data())} />
          </Loading>
        </Errored>
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          Connects, sends 2 messages, then simulates a terminal error after ~3 s.
        </p>
      </Container>
    );
  },
});

export const JsonTransformStory = meta.story({
  name: "JSON transform & typed data",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `transform: json` to decode raw SSE strings as JSON. The `data` signal becomes fully typed — here `{ sensor: string; value: number; unit: string }`. `initialValue` skips the `<Loading>` pending state when a sensible default is available on first render.",
      },
    },
  },
  render: () => {
    type Reading = { sensor: string; value: number; unit: string };

    const READINGS: Reading[] = [
      { sensor: "temperature", value: 21.4, unit: "°C" },
      { sensor: "humidity", value: 54.8, unit: "%" },
      { sensor: "pressure", value: 1013.2, unit: "hPa" },
      { sensor: "CO₂", value: 412, unit: "ppm" },
    ];

    const { data, readyState } = createSSE<Reading>("mock://json-sensor", {
      source: makePeriodicMock(
        READINGS.map(r => JSON.stringify(r)),
        2500,
      ),
      transform: json,
      initialValue: READINGS[0]!,
    });

    return (
      <Container width={280}>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}
        >
          <span style={{ "font-size": font.sizeBase, color: colors.muted }}>Sensor feed</span>
          <Badge variant={STATE_VARIANT[readyState()]}>{STATE_LABEL[readyState()]}</Badge>
        </div>
        <Card>
          <StatRow label="sensor" value={data().sensor} />
          <StatRow label="reading" value={`${data().value} ${data().unit}`} />
        </Card>
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          Cycles through 4 sensor readings every 2.5 s via{" "}
          <code style={{ "font-family": font.mono, "font-size": font.sizeSm }}>
            transform: json
          </code>
          .
        </p>
      </Container>
    );
  },
});

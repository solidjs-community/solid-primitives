import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createWS,
  createWSMessage,
  createWSState,
  createReconnectingWS,
  makeHeartbeatWS,
} from "@solid-primitives/websocket";
import type { ReconnectingWebSocket } from "@solid-primitives/websocket";
import readme from "../README.md?raw";
import {
  Badge,
  Button,
  ButtonRow,
  Card,
  Container,
  EventLog,
  Section,
  Stat,
  colors,
  font,
  radii,
  inputStyle,
} from "../../../.storybook/ui/index.js";

// ─── Simulated WebSocket ──────────────────────────────────────────────────────

class SimulatedWS extends EventTarget {
  readyState: 0 | 1 | 2 | 3 = 0;
  binaryType: BinaryType = "blob";
  bufferedAmount = 0;
  extensions = "";
  protocol = "";
  url = "ws://simulated";
  CONNECTING = 0 as const;
  OPEN = 1 as const;
  CLOSING = 2 as const;
  CLOSED = 3 as const;
  onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null = null;
  onerror: ((this: WebSocket, ev: Event) => unknown) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null = null;
  onopen: ((this: WebSocket, ev: Event) => unknown) | null = null;

  // No-op — overridden instance-level by makeWS and story interceptors
  send(_data: string | ArrayBufferLike | ArrayBufferView | Blob) {}

  close(code?: number, _reason?: string) {
    if (this.readyState >= 2) return;
    this.readyState = 2;
    setTimeout(() => {
      this.readyState = 3;
      this.dispatchEvent(
        new CloseEvent("close", { code: code ?? 1000, wasClean: !code || code === 1000 }),
      );
    }, 60);
  }

  simOpen() {
    if (this.readyState !== 0) return;
    this.readyState = 1;
    this.dispatchEvent(new Event("open"));
  }

  simReceive(data: string) {
    this.dispatchEvent(new MessageEvent("message", { data }));
  }

  simDrop() {
    this.readyState = 3;
    this.dispatchEvent(new CloseEvent("close", { code: 1006, wasClean: false }));
  }
}

/** Replaces window.WebSocket with a factory that creates SimulatedWS instances.
 *  Restores the original on owner cleanup. */
function installMockWS(onNew: (ws: SimulatedWS) => void) {
  const orig = window.WebSocket;
  (window as any).WebSocket = function MockWS(url: string) {
    const ws = new SimulatedWS();
    ws.url = url;
    onNew(ws);
    return ws;
  };
  onCleanup(() => void ((window as any).WebSocket = orig));
}

function ts() {
  return new Date().toLocaleTimeString();
}

const STATE_LABELS = ["Connecting", "Open", "Closing", "Closed"] as const;
const STATE_VARIANTS = ["warning", "success", "warning", "default"] as const;

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = preview.meta({
  title: "Network/Websocket",
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

// ─── createWSState ────────────────────────────────────────────────────────────

export const WSStateStory = meta.story({
  name: "Reactive connection state",
  parameters: {
    docs: {
      description: {
        story:
          "`createWSState(ws)` wraps any `WebSocket` and returns a reactive `Accessor<0 | 1 | 2 | 3>` mirroring the socket's `readyState`. It attaches `open` and `close` listeners and patches `ws.close()` to set state `2` (CLOSING) immediately — before the handshake completes.",
      },
    },
  },
  render: () => {
    let mock: SimulatedWS | null = null;
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);
    const logEntry = (label: string) =>
      setLog(prev => [{ label, time: ts() }, ...prev].slice(0, 5));

    installMockWS(ws => {
      mock = ws;
      setTimeout(() => ws.simOpen(), 600);
    });

    const ws = createWS("ws://simulated");
    const state = createWSState(ws);

    createEffect(
      () => state(),
      s => { logEntry(`→ ${STATE_LABELS[s]} (${s})`); },
    );

    return (
      <Container width={340}>
        <h3 style={{ margin: 0, "font-size": "1rem" }}>createWSState</h3>

        <Section title="readyState">
          <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
            <Badge variant={STATE_VARIANTS[state()]}>{STATE_LABELS[state()]}</Badge>
            <span
              style={{
                "font-family": font.mono,
                color: colors.muted,
                "font-size": font.sizeSm,
              }}
            >
              {state()}
            </span>
          </div>
        </Section>

        <Section title="Simulate">
          <ButtonRow>
            <Button onClick={() => ws.close()} disabled={state() !== 1} variant="outline">
              Close
            </Button>
            <Button onClick={() => mock?.simDrop()} disabled={state() >= 2} variant="outline">
              Force Drop
            </Button>
          </ButtonRow>
        </Section>

        <Section title="Event log">
          <EventLog entries={log()} />
        </Section>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
          Socket auto-opens after 600 ms. "Close" sends a clean handshake (1000); "Force Drop"
          simulates an involuntary disconnect (1006). Refresh the panel to reset.
        </p>
      </Container>
    );
  },
});

// ─── createWSMessage ──────────────────────────────────────────────────────────

const DEMO_MESSAGES = [
  '{"type":"update","value":42}',
  "Hello from the server!",
  '{"type":"ping"}',
  "Status: all systems nominal",
  '{"type":"data","items":[1,2,3]}',
];

export const WSMessageStory = meta.story({
  name: "Latest received message",
  parameters: {
    docs: {
      description: {
        story:
          "`createWSMessage<T>(ws)` returns a reactive `Accessor<T | undefined>` holding the **most recently received** message, starting as `undefined`. Because it is backed by a signal, only the last message in a reactive flush is observed — use `wsMessageIterable` when every message must be processed.",
      },
    },
  },
  render: () => {
    const mock = new SimulatedWS();
    const message = createWSMessage<string>(mock as unknown as WebSocket);
    const state = createWSState(mock as unknown as WebSocket);
    let msgIdx = 0;

    setTimeout(() => mock.simOpen(), 300);

    return (
      <Container width={340}>
        <h3 style={{ margin: 0, "font-size": "1rem" }}>createWSMessage</h3>

        <Section title="Connection">
          <Badge variant={STATE_VARIANTS[state()]}>{STATE_LABELS[state()]}</Badge>
        </Section>

        <Section title="message()">
          <div
            style={{
              background: colors.dark,
              "border-radius": radii.lg,
              padding: "0.6rem 0.75rem",
              "font-family": font.mono,
              "font-size": font.sizeSm,
              "word-break": "break-all",
              "min-height": "2.5rem",
              color: message() !== undefined ? colors.darkFg : colors.muted,
            }}
          >
            {message() !== undefined ? message() : "undefined"}
          </div>
        </Section>

        <Section title="Simulate">
          <ButtonRow>
            <Button
              onClick={() => {
                mock.simReceive(DEMO_MESSAGES[msgIdx % DEMO_MESSAGES.length]!);
                msgIdx++;
              }}
              disabled={state() !== 1}
              variant="outline"
            >
              Receive next message
            </Button>
            <Button onClick={() => mock.simDrop()} disabled={state() >= 2} variant="outline">
              Drop
            </Button>
          </ButtonRow>
        </Section>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
          Cycles through {DEMO_MESSAGES.length} preset payloads. <code>message()</code> is{" "}
          <code>undefined</code> until the first message arrives.
        </p>
      </Container>
    );
  },
});

// ─── createWS ────────────────────────────────────────────────────────────────

export const CreateWSStory = meta.story({
  name: "Buffered send queue",
  parameters: {
    docs: {
      description: {
        story:
          "`createWS(url)` opens a WebSocket that closes automatically on owner disposal. Both `makeWS` and `createWS` add a **buffered send queue**: messages sent before the connection opens are enqueued and flushed in order when the `open` event fires. Send a message while _Connecting_ to see the queue in action — it will be delivered once the socket opens.",
      },
    },
  },
  render: () => {
    let mock: SimulatedWS | null = null;
    const [chatLog, setChatLog] = createSignal<{ from: "me" | "server"; text: string }[]>([]);
    const [draft, setDraft] = createSignal("");

    installMockWS(ws => {
      mock = ws;
      // Intercept the bound _send captured by makeWS so echoes are triggered
      // for both directly-sent and queue-flushed messages
      const origSend = ws.send.bind(ws);
      ws.send = (data: any) => {
        origSend(data);
        setTimeout(() => ws.simReceive(`Echo: ${String(data)}`), 400);
      };
      // Delay open to demonstrate the send queue
      setTimeout(() => ws.simOpen(), 1200);
    });

    const ws = createWS("ws://simulated");
    const state = createWSState(ws);
    const message = createWSMessage<string>(ws);

    createEffect(
      () => message(),
      msg => {
        if (msg !== undefined)
          setChatLog(prev => [...prev, { from: "server", text: msg }]);
      },
    );

    const send = () => {
      const text = draft().trim();
      if (!text) return;
      setChatLog(prev => [
        ...prev,
        { from: "me", text: state() === 1 ? text : `[queued] ${text}` },
      ]);
      ws.send(text);
      setDraft("");
    };

    return (
      <Container width={400}>
        <h3 style={{ margin: 0, "font-size": "1rem" }}>createWS</h3>

        <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
          <Badge variant={STATE_VARIANTS[state()]}>{STATE_LABELS[state()]}</Badge>
          <Show when={state() === 0}>
            <span style={{ "font-size": font.sizeSm, color: colors.muted }}>
              opens in ~1.2 s — send now to queue
            </span>
          </Show>
        </div>

        <div
          style={{
            background: colors.dark,
            "border-radius": radii.lg,
            padding: "0.75rem",
            "min-height": "110px",
            "max-height": "160px",
            "overflow-y": "auto",
            display: "flex",
            "flex-direction": "column",
            gap: "0.3rem",
          }}
        >
          <Show
            when={chatLog().length > 0}
            fallback={
              <span
                style={{ "font-family": font.mono, "font-size": font.sizeSm, color: colors.muted }}
              >
                waiting…
              </span>
            }
          >
            <For each={chatLog()}>
              {entry => (
                <div
                  style={{
                    "font-family": font.mono,
                    "font-size": font.sizeSm,
                    color: entry.from === "me" ? colors.darkFg : colors.warning,
                  }}
                >
                  <span style={{ color: colors.muted }}>
                    {entry.from === "me" ? "you: " : "srv: "}
                  </span>
                  {entry.text}
                </div>
              )}
            </For>
          </Show>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={draft()}
            onInput={e => setDraft(e.currentTarget.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Type a message…"
            style={inputStyle}
            disabled={state() >= 2}
          />
          <Button onClick={send} disabled={state() >= 2}>
            Send
          </Button>
        </div>

        <ButtonRow>
          <Button
            onClick={() => mock?.simDrop()}
            disabled={state() !== 1}
            variant="outline"
          >
            Drop connection
          </Button>
        </ButtonRow>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
          The simulated server echoes every message. <code>createWS</code> does not
          auto-reconnect — use <code>createReconnectingWS</code> for that.
        </p>
      </Container>
    );
  },
});

// ─── createReconnectingWS ─────────────────────────────────────────────────────

export const ReconnectingWSStory = meta.story({
  name: "Auto-reconnect on drop",
  parameters: {
    docs: {
      description: {
        story:
          "`createReconnectingWS(url, protocols?, options?)` returns a `WebSocket`-shaped proxy that transparently opens a new underlying connection whenever the server drops it involuntarily (close code ≠ 1000). `delay` controls the ms between attempts; `retries` caps the total reconnect count. Calling `ws.close()` with a clean code stops reconnecting permanently.",
      },
    },
  },
  render: () => {
    let mock: SimulatedWS | null = null;
    let connCount = 0;
    const [reconnects, setReconnects] = createSignal(0);
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    const logEntry = (label: string) =>
      setLog(prev => [{ label, time: ts() }, ...prev].slice(0, 6));

    installMockWS(ws => {
      mock = ws;
      setTimeout(() => {
        connCount++;
        ws.simOpen();
        if (connCount === 1) logEntry("connected");
        else {
          setReconnects(r => r + 1);
          logEntry(`reconnect #${connCount - 1} — open`);
        }
      }, 400);
    });

    const ws = createReconnectingWS("ws://simulated", undefined, { delay: 1000, retries: 10 });
    const state = createWSState(ws);

    return (
      <Container width={360}>
        <h3 style={{ margin: 0, "font-size": "1rem" }}>createReconnectingWS</h3>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Stat label="State" labelWidth="44px">
            {STATE_LABELS[state()]}
          </Stat>
          <Stat label="Reconnects" labelWidth="76px">
            {reconnects()}
          </Stat>
        </div>

        <EventLog entries={log()} />

        <ButtonRow>
          <Button
            onClick={() => {
              logEntry("dropped — reconnecting in 1 s…");
              mock?.simDrop();
            }}
            disabled={state() !== 1}
            variant="outline"
          >
            Drop connection
          </Button>
          <Button
            onClick={() => {
              logEntry("closed (permanent)");
              ws.close();
            }}
            disabled={state() >= 2}
            variant="outline"
          >
            Close (permanent)
          </Button>
        </ButtonRow>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
          "Drop" simulates an involuntary close (code 1006) — the proxy reconnects after 1 s.
          "Close" sends a clean close (code 1000) which permanently stops reconnecting.
        </p>
      </Container>
    );
  },
});

// ─── makeHeartbeatWS ──────────────────────────────────────────────────────────

export const HeartbeatWSStory = meta.story({
  name: "Heartbeat watchdog",
  parameters: {
    docs: {
      description: {
        story:
          "`makeHeartbeatWS(rws, options?)` wraps a `ReconnectingWebSocket` with a ping/pong watchdog. After each received message it schedules a ping in `interval` ms; before each send it starts a pong-timeout — if no message arrives within `wait` ms it calls `ws.reconnect()`. Toggle **Suppress pong** to watch the timeout expire and the connection auto-heal.",
      },
    },
  },
  render: () => {
    let pongEnabled = true;
    let connCount = 0;
    const [pongOn, setPongOn] = createSignal(true);
    const [reconnects, setReconnects] = createSignal(0);
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    const logEntry = (label: string) =>
      setLog(prev => [{ label, time: ts() }, ...prev].slice(0, 7));

    installMockWS(ws => {
      // Intercept _send (captured by makeWS before it replaces ws.send)
      // so we can detect pings and auto-pong
      const origSend = ws.send.bind(ws);
      ws.send = (data: any) => {
        origSend(data);
        logEntry(`↑ ${String(data)}`);
        if (pongEnabled) {
          setTimeout(() => {
            ws.simReceive("pong");
            logEntry("↓ pong");
          }, 150);
        }
      };
      setTimeout(() => {
        connCount++;
        ws.simOpen();
        if (connCount === 1) logEntry("connected");
        else {
          setReconnects(r => r + 1);
          logEntry("↻ reconnected");
        }
      }, 200);
    });

    const rws = createReconnectingWS("ws://simulated", undefined, { delay: 500, retries: 20 });
    const ws = makeHeartbeatWS(rws as ReconnectingWebSocket, { interval: 2000, wait: 3000 });
    const state = createWSState(ws as unknown as WebSocket);

    const togglePong = () => {
      pongEnabled = !pongEnabled;
      setPongOn(pongEnabled);
      logEntry(pongEnabled ? "pong enabled" : "pong suppressed — timeout in ~3 s");
    };

    return (
      <Container width={360}>
        <h3 style={{ margin: 0, "font-size": "1rem" }}>makeHeartbeatWS</h3>

        <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
          <Badge variant={STATE_VARIANTS[state()]}>{STATE_LABELS[state()]}</Badge>
          <Stat label="Reconnects" labelWidth="76px">
            {reconnects()}
          </Stat>
        </div>

        <EventLog entries={log()} />

        <ButtonRow>
          <Button onClick={togglePong} variant={pongOn() ? "outline" : "primary"}>
            {pongOn() ? "Suppress pong" : "Resume pong"}
          </Button>
        </ButtonRow>

        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.muted }}>
          Ping every 2 s; pong timeout 3 s. Suppress the pong and watch the timeout trigger an
          automatic reconnect.
        </p>
      </Container>
    );
  },
});

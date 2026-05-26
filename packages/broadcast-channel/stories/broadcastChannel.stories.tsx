import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { makeBroadcastChannel, createBroadcastChannel } from "@solid-primitives/broadcast-channel";
import readme from "../README.md?raw";
import { container } from "./_helpers.js";
import { inputStyle, logBox, Button } from "../../../.storybook/ui/index.js";

const CHANNEL = "sp-broadcast-demo";

const channelBadge = {
  background: "#e0f2fe",
  color: "#0369a1",
  "border-radius": "4px",
  padding: "0.15rem 0.5rem",
  "font-size": "0.8rem",
  "font-family": "monospace",
} as const;

const meta = preview.meta({
  title: "Browser APIs/Broadcast Channel",
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

export const MakeBroadcastChannelStory = meta.story({
  name: "makeBroadcastChannel",
  parameters: {
    docs: {
      description: {
        story:
          "`makeBroadcastChannel<T>(name)` creates (or joins) a named BroadcastChannel and returns an imperative API: `onMessage(cb)` subscribes to incoming messages; `postMessage(data)` sends to all **other** browsing contexts on the same channel. Multiple calls with the same `name` share a single underlying channel — the channel closes only when the last owner unmounts. Click **Open new tab ↗**, navigate to any Broadcast Channel story there, post a message, and watch it arrive in the log below.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<string[]>([]);
    const [draft, setDraft] = createSignal("Hello from Storybook!");

    const { onMessage, postMessage, channelName } = makeBroadcastChannel<string>(CHANNEL);

    onMessage(({ data }) => {
      const ts = new Date().toLocaleTimeString();
      setLog(prev => [`[${ts}] ${data}`, ...prev].slice(0, 6));
    });

    const send = () => {
      const msg = draft().trim();
      if (msg) postMessage(msg);
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>makeBroadcastChannel</h3>

        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "0.5rem",
            "flex-wrap": "wrap",
          }}
        >
          <span style={{ "font-size": "0.85rem", color: "#64748b" }}>Channel:</span>
          <code style={channelBadge}>{channelName}</code>
          <Button
            onClick={() => window.open(window.location.href, "_blank")}
            variant="outline"
            style={{ "margin-left": "auto", "font-size": "0.8rem", padding: "0.3rem 0.65rem" }}
          >
            Open new tab ↗
          </Button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={draft()}
            onInput={e => setDraft(e.currentTarget.value)}
            placeholder="Message to send…"
            style={inputStyle}
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <Button onClick={send}>Post</Button>
        </div>

        <div style={logBox}>
          <Show
            when={log().length > 0}
            fallback={
              <span style={{ color: "#94a3b8" }}>
                No messages yet — open a second tab and post from there.
              </span>
            }
          >
            <For each={log()}>
              {(entry, i) => (
                <div style={{ color: i() === 0 ? "#1e293b" : "#94a3b8" }}>{entry}</div>
              )}
            </For>
          </Show>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          BroadcastChannel only delivers to <em>other</em> browsing contexts — messages posted here
          will not appear in this same tab's log.
        </p>
      </div>
    );
  },
});

export const CreateBroadcastChannelStory = meta.story({
  name: "createBroadcastChannel",
  parameters: {
    docs: {
      description: {
        story:
          "`createBroadcastChannel<T>(name)` wraps `makeBroadcastChannel` in a reactive layer: instead of an `onMessage` callback it exposes `message` — a signal accessor that updates automatically whenever another browsing context posts to the same channel. The `message()` value starts as `null` and becomes the last received payload. Open a second tab, switch to either Broadcast Channel story (both use channel `sp-broadcast-demo`), post a message there, and the signal below will update reactively.",
      },
    },
  },
  render: () => {
    const [draft, setDraft] = createSignal("Hi from tab 2!");
    const { message, postMessage, channelName } = createBroadcastChannel<string>(CHANNEL);

    const send = () => {
      const msg = draft().trim();
      if (msg) postMessage(msg);
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createBroadcastChannel</h3>

        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "0.5rem",
            "flex-wrap": "wrap",
          }}
        >
          <span style={{ "font-size": "0.85rem", color: "#64748b" }}>Channel:</span>
          <code style={channelBadge}>{channelName}</code>
          <Button
            onClick={() => window.open(window.location.href, "_blank")}
            variant="outline"
            style={{ "margin-left": "auto", "font-size": "0.8rem", padding: "0.3rem 0.65rem" }}
          >
            Open new tab ↗
          </Button>
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.75rem 1rem",
            display: "flex",
            "flex-direction": "column",
            gap: "0.3rem",
          }}
        >
          <span style={{ "font-size": "0.8rem", color: "#64748b", "font-family": "monospace" }}>
            message()
          </span>
          <span
            style={{
              "font-family": "monospace",
              "font-size": "1.05rem",
              color: message() !== null ? "#16a34a" : "#94a3b8",
              "font-weight": "600",
              "word-break": "break-all",
            }}
          >
            {message() !== null ? `"${message()}"` : "null"}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={draft()}
            onInput={e => setDraft(e.currentTarget.value)}
            placeholder="Message to send…"
            style={inputStyle}
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <Button onClick={send}>Post</Button>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          <code>message()</code> is <code>null</code> until a message arrives from another tab.
          Both stories share channel <code>sp-broadcast-demo</code>, so posting from either tab
          updates this signal.
        </p>
      </div>
    );
  },
});

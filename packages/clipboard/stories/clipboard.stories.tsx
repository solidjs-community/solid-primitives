import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  writeClipboard,
  readClipboard,
  createClipboard,
  copyToClipboard,
  input as inputHighlight,
  type ClipboardSetter,
} from "@solid-primitives/clipboard";
import readme from "../README.md?raw";
import { inputStyle, Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Clipboard",
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

export const CopyDirective = meta.story({
  name: "copyToClipboard ref directive",
  parameters: {
    docs: {
      description: {
        story:
          "`copyToClipboard()` returns a ref callback that writes an element's value to the clipboard on click. On `<input>`/`<textarea>` it copies `.value`; on other elements it copies `.innerHTML`. Pass `options.value` to override, and `options.highlight` (e.g. `input()`) to select the text after copying.",
      },
    },
  },
  render: () => {
    const [flash, setFlash] = createSignal("");

    const notifyingSetter: ClipboardSetter = async data => {
      await writeClipboard(data);
      const preview =
        typeof data === "string"
          ? `"${data.slice(0, 28)}${data.length > 28 ? "…" : ""}"`
          : `[${(data as ClipboardItem[]).length} item(s)]`;
      setFlash(preview);
      setTimeout(() => setFlash(""), 1800);
    };

    return (
      <Container>
        <h3 style={{ margin: 0 }}>copyToClipboard</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
            Click input to copy its value (+ highlights selection)
          </label>
          <input
            ref={copyToClipboard({ highlight: inputHighlight(), setter: notifyingSetter })}
            value="Click me to copy this text"
            readOnly
            style={{ ...inputStyle, cursor: "pointer" }}
          />
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
            Button with explicit value override
          </label>
          <Button
            ref={copyToClipboard({ value: "Hello from a button!", setter: notifyingSetter })}
            style={{ width: "100%" }}
          >
            Copy "Hello from a button!"
          </Button>
        </div>

        <div style={{ "min-height": "1.4rem" }}>
          <Show when={flash()}>
            <span style={{ color: "#10b981", "font-size": "0.9rem" }}>✓ Copied {flash()}</span>
          </Show>
        </div>
      </Container>
    );
  },
});

export const ImperativeAPI = meta.story({
  name: "writeClipboard + readClipboard",
  parameters: {
    docs: {
      description: {
        story:
          "`writeClipboard` and `readClipboard` are one-shot async functions for imperative use. `writeClipboard` accepts a string or `ClipboardItem[]`. `readClipboard` returns a `Promise<ClipboardItem[]>` — the browser may prompt for clipboard-read permission.",
      },
    },
  },
  render: () => {
    const [text, setText] = createSignal("Hello, clipboard!");
    const [writeMsg, setWriteMsg] = createSignal("");
    const [readResult, setReadResult] = createSignal("");
    const [readMsg, setReadMsg] = createSignal("");

    const handleWrite = async () => {
      setWriteMsg("");
      try {
        await writeClipboard(text());
        setWriteMsg("✓ Written to clipboard");
      } catch (e) {
        setWriteMsg(`✗ ${(e as Error).message}`);
      }
    };

    const handleRead = async () => {
      setReadResult("");
      setReadMsg("");
      try {
        const items = await readClipboard();
        if (!items.length) {
          setReadMsg("Clipboard is empty");
          return;
        }
        const item = items[0]!;
        const type = item.types.find(t => t === "text/plain") ?? item.types[0];
        if (!type) {
          setReadMsg("No readable type");
          return;
        }
        const blob = await item.getType(type);
        if (blob.type === "text/plain") {
          setReadResult(await blob.text());
        } else {
          setReadMsg(`[${blob.type} — binary content]`);
        }
      } catch (e) {
        setReadMsg(`✗ ${(e as Error).message}`);
      }
    };

    return (
      <Container>
        <h3 style={{ margin: 0 }}>writeClipboard + readClipboard</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
          <label style={{ "font-size": "0.85rem", color: "#64748b" }}>Write</label>
          <input
            value={text()}
            onInput={e => setText(e.currentTarget.value)}
            style={inputStyle}
          />
          <Button onClick={handleWrite}>Write to clipboard</Button>
          <Show when={writeMsg()}>
            <span
              style={{
                "font-size": "0.85rem",
                color: writeMsg().startsWith("✓") ? "#10b981" : "#ef4444",
              }}
            >
              {writeMsg()}
            </span>
          </Show>
        </div>

        <hr style={{ border: "none", "border-top": "1px solid #e2e8f0", margin: 0 }} />

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
          <label style={{ "font-size": "0.85rem", color: "#64748b" }}>Read</label>
          <Button onClick={handleRead}>Read from clipboard</Button>
          <Show when={readResult()}>
            <div
              style={{
                background: "#f8fafc",
                padding: "0.5rem 0.75rem",
                "border-radius": "6px",
                "font-size": "0.9rem",
                "word-break": "break-all",
                border: "1px solid #e2e8f0",
              }}
            >
              {readResult()}
            </div>
          </Show>
          <Show when={readMsg()}>
            <span style={{ "font-size": "0.85rem", color: "#64748b" }}>{readMsg()}</span>
          </Show>
        </div>
      </Container>
    );
  },
});

export const ReactiveClipboard = meta.story({
  name: "createClipboard",
  parameters: {
    docs: {
      description: {
        story:
          "`createClipboard(data?)` returns `[clipboardItems, refetch, write]`. Pass a signal as `data` to write to the clipboard reactively on every change (deferred by default — initial value is skipped). Call `refetch()` to read the current clipboard into the `clipboardItems` accessor.",
      },
    },
  },
  render: () => {
    const [text, setText] = createSignal("Type something then write it");
    const [writeSignal, setWriteSignal] = createSignal<string | ClipboardItem[]>("");
    const [clipboard, refetch] = createClipboard(writeSignal);
    const [writeFlash, setWriteFlash] = createSignal(false);

    const handleWrite = () => {
      setWriteSignal(text());
      setWriteFlash(true);
      setTimeout(() => setWriteFlash(false), 1500);
    };

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createClipboard</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
          <input
            value={text()}
            onInput={e => setText(e.currentTarget.value)}
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button onClick={handleWrite} style={{ flex: 1 }}>
              Write to clipboard
            </Button>
            <Button onClick={refetch} variant="outline" style={{ flex: 1 }}>
              Read clipboard
            </Button>
          </div>
          <Show when={writeFlash()}>
            <span style={{ "font-size": "0.85rem", color: "#10b981" }}>✓ Written</span>
          </Show>
        </div>

        <div>
          <span style={{ "font-size": "0.85rem", color: "#64748b" }}>Clipboard contents</span>
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              "border-radius": "6px",
              padding: "0.5rem 0.75rem",
              "min-height": "2.5rem",
              "margin-top": "0.35rem",
            }}
          >
            <For
              each={clipboard()}
              fallback={
                <em style={{ "font-size": "0.85rem", color: "#94a3b8" }}>
                  Click "Read clipboard" to load
                </em>
              }
            >
              {item => (
                <div style={{ "font-size": "0.9rem", "word-break": "break-all" }}>
                  <span style={{ color: "#64748b", "font-size": "0.78rem" }}>[{item.type}]</span>{" "}
                  {item.text ?? "(binary)"}
                </div>
              )}
            </For>
          </div>
        </div>

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          Signal changes after the first are written automatically. Use{" "}
          <code>isPending(() =&gt; clipboard())</code> to detect an in-flight read.
        </p>
      </Container>
    );
  },
});

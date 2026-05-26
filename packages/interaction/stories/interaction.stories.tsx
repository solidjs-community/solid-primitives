import { createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createInteractOutside,
  interactOutside,
  makeInteractOutside,
} from "@solid-primitives/interaction";
import readme from "../README.md?raw";
import { container } from "./_helpers.js";
import { btnStyle, popoverStyle } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Interaction",
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

export const CreateInteractOutsideStory = meta.story({
  name: "createInteractOutside",
  parameters: {
    docs: {
      description: {
        story:
          "`createInteractOutside(options, ref)` reactively attaches pointer and focus listeners that fire when the user interacts outside the referenced element. Pass `disabled: () => !open()` to suspend the listener when the target is not interactive. The button is excluded via `shouldExcludeElement` so toggling does not immediately re-close the popover.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = createSignal(false);
    let popoverRef!: HTMLDivElement;
    let triggerRef!: HTMLButtonElement;

    createInteractOutside(
      {
        disabled: () => !open(),
        onInteractOutside: () => setOpen(false),
        shouldExcludeElement: el => triggerRef?.contains(el) ?? false,
      },
      () => popoverRef,
    );

    return (
      <div style={{ ...container, position: "relative" }}>
        <h3 style={{ margin: 0 }}>createInteractOutside</h3>

        <button
          ref={el => (triggerRef = el)}
          onClick={() => setOpen(p => !p)}
          style={{
            ...btnStyle,
            background: open() ? "#6366f1" : "#f8fafc",
            color: open() ? "white" : "#1e293b",
            border: open() ? "1px solid #6366f1" : "1px solid #e2e8f0",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {open() ? "Popover open ▲" : "Open popover ▼"}
        </button>

        <div
          ref={el => (popoverRef = el)}
          style={{
            ...popoverStyle,
            display: open() ? "block" : "none",
          }}
        >
          <strong style={{ "font-size": "0.9rem", color: "#1e293b" }}>Popover</strong>
          <p style={{ margin: "0.5rem 0 0", "font-size": "0.85rem" }}>
            Click anywhere outside this box (and not on the button above) to close.
          </p>
          <button
            onClick={() => setOpen(false)}
            style={{ ...btnStyle, "margin-top": "0.75rem", "font-size": "0.8rem" }}
          >
            Close manually
          </button>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          <code>disabled: () =&gt; !open()</code> suspends the listener while the popover is
          hidden, so no unnecessary event processing occurs.
        </p>
      </div>
    );
  },
});

export const InteractOutsideRefStory = meta.story({
  name: "interactOutside (ref factory)",
  parameters: {
    docs: {
      description: {
        story:
          "`interactOutside(options)` is a ref factory: call it in a component body and pass the result directly to a JSX `ref` prop. When the element mounts, listeners attach automatically; when it unmounts (e.g. inside a `<Show>`), `onCleanup` removes them. No manual cleanup required.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = createSignal(false);
    let triggerRef!: HTMLButtonElement;

    return (
      <div style={{ ...container, position: "relative" }}>
        <h3 style={{ margin: 0 }}>interactOutside</h3>

        <button
          ref={el => (triggerRef = el)}
          onClick={() => setOpen(p => !p)}
          style={{
            ...btnStyle,
            background: open() ? "#f97316" : "#f8fafc",
            color: open() ? "white" : "#1e293b",
            border: open() ? "1px solid #f97316" : "1px solid #e2e8f0",
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {open() ? "Dropdown open ▲" : "Open dropdown ▼"}
        </button>

        <Show when={open()}>
          <div
            ref={interactOutside({
              onInteractOutside: () => setOpen(false),
              shouldExcludeElement: el => triggerRef?.contains(el) ?? false,
            })}
            style={popoverStyle}
          >
            <strong style={{ "font-size": "0.9rem", color: "#1e293b" }}>Dropdown</strong>
            <p style={{ margin: "0.5rem 0 0", "font-size": "0.85rem" }}>
              Mounted via <code>&lt;Show&gt;</code> — listeners attach on mount and are removed
              automatically on unmount.
            </p>
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: "0.25rem",
                "margin-top": "0.75rem",
              }}
            >
              {["Option 1", "Option 2", "Option 3"].map(opt => (
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    ...btnStyle,
                    "text-align": "left",
                    width: "100%",
                    "font-size": "0.85rem",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </Show>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          The <code>ref</code> callback is the only wiring needed — no signals or effects to
          manage.
        </p>
      </div>
    );
  },
});

export const MakeInteractOutsideStory = meta.story({
  name: "makeInteractOutside (imperative)",
  parameters: {
    docs: {
      description: {
        story:
          "`makeInteractOutside(el, options)` is the non-reactive base primitive. It attaches listeners immediately and returns a cleanup function — no Solid lifecycle required. Use it when you already have a stable element reference and need manual control over attachment.",
      },
    },
  },
  render: () => {
    const [status, setStatus] = createSignal("Not listening.");
    const [listening, setListening] = createSignal(false);
    let cleanup: (() => void) | undefined;
    let boxRef!: HTMLDivElement;

    const attach = () => {
      cleanup?.();
      cleanup = makeInteractOutside(boxRef, {
        onPointerDownOutside: () =>
          setStatus(`Outside click at ${new Date().toLocaleTimeString()}`),
        onFocusOutside: () => setStatus(`Focus moved outside at ${new Date().toLocaleTimeString()}`),
      });
      setListening(true);
      setStatus("Listening for outside interactions…");
    };

    const detach = () => {
      cleanup?.();
      cleanup = undefined;
      setListening(false);
      setStatus("Detached.");
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>makeInteractOutside</h3>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={attach}
            disabled={listening()}
            style={{
              ...btnStyle,
              flex: 1,
              opacity: listening() ? 0.45 : 1,
              background: listening() ? "#f1f5f9" : "#f8fafc",
            }}
          >
            Attach listeners
          </button>
          <button
            onClick={detach}
            disabled={!listening()}
            style={{
              ...btnStyle,
              flex: 1,
              opacity: !listening() ? 0.45 : 1,
            }}
          >
            Detach listeners
          </button>
        </div>

        <div
          ref={el => (boxRef = el)}
          style={{
            border: `2px solid ${listening() ? "#6366f1" : "#e2e8f0"}`,
            "border-radius": "8px",
            padding: "1.25rem",
            "text-align": "center",
            "font-size": "0.9rem",
            color: "#475569",
            transition: "border-color 0.2s",
          }}
        >
          <span style={{ "font-weight": "600", color: listening() ? "#6366f1" : "#94a3b8" }}>
            Observed element
          </span>
          <p style={{ margin: "0.4rem 0 0", "font-size": "0.8rem" }}>
            Click inside here — nothing happens. Click outside to trigger the handler.
          </p>
        </div>

        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            "border-radius": "6px",
            padding: "0.5rem 0.75rem",
            "font-size": "0.85rem",
            color: "#334155",
            "min-height": "36px",
            "font-family": "monospace",
          }}
        >
          {status()}
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          The returned cleanup function removes all listeners. Useful outside Solid component
          trees or when lifecycle hooks are unavailable.
        </p>
      </div>
    );
  },
});

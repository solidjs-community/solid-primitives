import { createEffect, createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  makeBodyCursor,
  createBodyCursor,
  createElementCursor,
  createDragCursor,
  cursorRef,
} from "@solid-primitives/cursor";
import type { CursorProperty } from "@solid-primitives/cursor";
import readme from "../README.md?raw";
import {
  Container,
  Button,
  Card,
  StatRow,
  BoolRow,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "DOM/Cursor",
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

// ─── makeBodyCursor ───────────────────────────────────────────────────────────

export const LoadingState = meta.story({
  name: "Loading state",
  parameters: {
    docs: {
      description: {
        story:
          "`makeBodyCursor` applies a cursor to `document.body` immediately and returns a cleanup function. No reactive owner needed — ideal for imperative async flows where you want to show `wait` while an operation runs, then restore the previous cursor.",
      },
    },
  },
  render: () => {
    const [loading, setLoading] = createSignal(false);

    const simulate = () => {
      if (loading()) return;
      setLoading(true);
      const restore = makeBodyCursor("wait");
      setTimeout(() => {
        restore();
        setLoading(false);
      }, 2000);
    };

    return (
      <Container width={320}>
        <h3 style={{ margin: 0 }}>makeBodyCursor</h3>

        <Button onClick={simulate} disabled={loading()}>
          {loading() ? "Loading… (2 s)" : "Simulate async operation"}
        </Button>

        <Card>
          <StatRow label="body cursor" value={loading() ? "wait" : "default"} />
        </Card>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Move the pointer around the page — <code>wait</code> appears everywhere and is
          automatically restored when the operation finishes.
        </p>
      </Container>
    );
  },
});

// ─── createBodyCursor ─────────────────────────────────────────────────────────

const BODY_CURSORS: CursorProperty[] = [
  "pointer",
  "crosshair",
  "help",
  "wait",
  "not-allowed",
  "zoom-in",
  "grab",
  "progress",
];

export const BodyCursorReactive = meta.story({
  name: "Reactive body cursor",
  parameters: {
    docs: {
      description: {
        story:
          "`createBodyCursor` binds a signal to the body cursor reactively. Returning a falsy value unsets it. The cursor applies page-wide — move the pointer anywhere to see it.",
      },
    },
  },
  render: () => {
    const [cursor, setCursor] = createSignal<CursorProperty | false>(false);
    createBodyCursor(cursor);

    return (
      <Container width={340}>
        <h3 style={{ margin: 0 }}>createBodyCursor</h3>

        <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.4rem" }}>
          <For each={BODY_CURSORS}>
            {c => (
              <Button
                variant={cursor() === c ? "primary" : "outline"}
                onClick={() => setCursor(prev => (prev === c ? false : c))}
                style={{ "font-size": "0.8rem", padding: "0.35rem 0.75rem" }}
              >
                {c}
              </Button>
            )}
          </For>
        </div>

        <Card>
          <StatRow label="active cursor" value={cursor() || "—"} />
        </Card>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Click a cursor to activate it page-wide. Click the active button again to deactivate.
        </p>
      </Container>
    );
  },
});

// ─── createElementCursor ──────────────────────────────────────────────────────

const ELEMENT_CURSORS: CursorProperty[] = [
  "pointer",
  "crosshair",
  "move",
  "help",
  "not-allowed",
  "zoom-in",
  "text",
  "copy",
];

export const ElementCursorToggle = meta.story({
  name: "Enable/disable on an element",
  parameters: {
    docs: {
      description: {
        story:
          "`createElementCursor` applies a cursor to a specific element reactively. Passing a falsy value for the target is all you need to disable it — no teardown code required.",
      },
    },
  },
  render: () => {
    const [el, setEl] = createSignal<HTMLElement>();
    const [enabled, setEnabled] = createSignal(true);
    const [cursor, setCursor] = createSignal<CursorProperty>("pointer");

    createElementCursor(() => (enabled() ? el() : false), cursor);

    return (
      <Container width={340}>
        <h3 style={{ margin: 0 }}>createElementCursor</h3>

        <div
          ref={setEl}
          style={{
            height: "72px",
            background: enabled() ? "#eef2ff" : "#f8fafc",
            border: `2px solid ${enabled() ? "#6366f1" : "#e2e8f0"}`,
            "border-radius": "8px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            transition: "all 0.2s",
          }}
        >
          <span
            style={{
              color: enabled() ? "#6366f1" : "#94a3b8",
              "font-size": "0.875rem",
              "font-family": "monospace",
            }}
          >
            {enabled() ? `cursor: ${cursor()}` : "cursor: (default)"}
          </span>
        </div>

        <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.4rem" }}>
          <For each={ELEMENT_CURSORS}>
            {c => (
              <Button
                variant={cursor() === c ? "primary" : "outline"}
                onClick={() => setCursor(c)}
                style={{ "font-size": "0.78rem", padding: "0.3rem 0.6rem" }}
              >
                {c}
              </Button>
            )}
          </For>
        </div>

        <Card>
          <BoolRow label="enabled" value={enabled()} />
        </Card>

        <Button variant="secondary" onClick={() => setEnabled(e => !e)}>
          {enabled() ? "Disable cursor" : "Enable cursor"}
        </Button>
      </Container>
    );
  },
});

// ─── createDragCursor ─────────────────────────────────────────────────────────

export const DragHandle = meta.story({
  name: "Grab/grabbing on drag",
  parameters: {
    docs: {
      description: {
        story:
          "`createDragCursor` shows `grab` on the target element and switches to `grabbing` on the body when a pointer is held down. Setting `grabbing` on the body ensures the cursor stays consistent even when the pointer moves off the element mid-drag.",
      },
    },
  },
  render: () => {
    const [el, setEl] = createSignal<HTMLElement>();
    const [dragging, setDragging] = createSignal(false);

    createDragCursor(el);

    // Mirror createDragCursor's internals: pointerdown on element, pointerup/cancel on
    // document so releasing outside the element boundary still resets the display.
    createEffect(
      () => el(),
      target => {
        if (!target) return;
        const down = () => setDragging(true);
        const up = () => setDragging(false);
        target.addEventListener("pointerdown", down);
        document.addEventListener("pointerup", up);
        document.addEventListener("pointercancel", up);
        return () => {
          target.removeEventListener("pointerdown", down);
          document.removeEventListener("pointerup", up);
          document.removeEventListener("pointercancel", up);
        };
      },
    );

    return (
      <Container width={300}>
        <h3 style={{ margin: 0 }}>createDragCursor</h3>

        <div
          ref={setEl}
          style={{
            padding: "1rem 1.25rem",
            background: dragging() ? "#eef2ff" : "#f8fafc",
            border: `2px solid ${dragging() ? "#6366f1" : "#e2e8f0"}`,
            "border-radius": "10px",
            "user-select": "none",
            "touch-action": "none",
            display: "flex",
            "align-items": "center",
            gap: "0.75rem",
            transition: "all 0.15s",
          }}
        >
          <span style={{ "font-size": "1.25rem", color: "#94a3b8", "line-height": 1 }}>⠿</span>
          <div>
            <div style={{ "font-weight": "600", "font-size": "0.875rem", color: "#1e293b" }}>
              Drag handle
            </div>
            <div style={{ "font-size": "0.75rem", color: "#64748b", "margin-top": "2px" }}>
              {dragging() ? "holding — grabbing cursor on body" : "hover to see grab"}
            </div>
          </div>
        </div>

        <Card>
          <StatRow label="element cursor" value={dragging() ? "(cleared)" : "grab"} />
          <StatRow label="body cursor" value={dragging() ? "grabbing" : "—"} />
        </Card>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          While holding, move the pointer off the element — the <code>grabbing</code> cursor
          follows everywhere.
        </p>
      </Container>
    );
  },
});

// ─── cursorRef ────────────────────────────────────────────────────────────────

const SHOWCASE_CURSORS: CursorProperty[] = [
  "pointer",
  "crosshair",
  "grab",
  "move",
  "not-allowed",
  "help",
  "zoom-in",
  "text",
  "copy",
  "wait",
  "progress",
  "cell",
];

export const CursorShowcase = meta.story({
  name: "Cursor sampler via ref",
  parameters: {
    docs: {
      description: {
        story:
          "`cursorRef` is a ref factory for applying a cursor inline in JSX. It accepts a static value or a reactive signal — the cursor is removed when the component unmounts. Hover each tile to preview that cursor type.",
      },
    },
  },
  render: () => {
    return (
      <Container width={340}>
        <h3 style={{ margin: 0 }}>cursorRef</h3>

        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(4, 1fr)",
            gap: "0.4rem",
          }}
        >
          <For each={SHOWCASE_CURSORS}>
            {c => (
              <div
                ref={cursorRef(c)}
                style={{
                  padding: "0.55rem 0.25rem",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  "border-radius": "6px",
                  "text-align": "center",
                  "font-size": "0.65rem",
                  "font-family": "monospace",
                  color: "#475569",
                  "user-select": "none",
                }}
              >
                {c}
              </div>
            )}
          </For>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Each tile uses <code>{"ref={cursorRef(\"…\")}"}</code>. Hover to see the cursor.
        </p>
      </Container>
    );
  },
});

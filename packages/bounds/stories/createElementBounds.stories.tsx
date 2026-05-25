import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createElementBounds, type UpdateGuard } from "@solid-primitives/bounds";
import readme from "../README.md?raw";
import { container, BoundsGrid } from "./_helpers.js";

const meta = preview.meta({
  title: "DOM/Bounds",
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

export const LiveBounds = meta.story({
  name: "Live element bounds",
  parameters: {
    docs: {
      description: {
        story:
          "`createElementBounds` returns a reactive store-like object that tracks an element's `getBoundingClientRect()` — updating on resize, scroll, and DOM mutation. Drag the sliders to resize the box and watch all six values update in real time.",
      },
    },
  },
  render: () => {
    const [width, setWidth] = createSignal(160);
    const [height, setHeight] = createSignal(100);

    let ref!: HTMLDivElement;
    const bounds = createElementBounds(() => ref);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createElementBounds</h3>

        <div
          ref={ref}
          style={{
            width: `${width()}px`,
            height: `${height()}px`,
            background: "#f97316",
            "border-radius": "8px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            color: "white",
            "font-weight": "600",
            transition: "width 0.1s, height 0.1s",
          }}
        >
          {width()} × {height()}
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
          <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
            Width: {width()}px
            <input
              type="range"
              min="80"
              max="300"
              value={width()}
              onInput={e => setWidth(+e.currentTarget.value)}
              style={{ display: "block", width: "100%" }}
            />
          </label>
          <label style={{ "font-size": "0.85rem", color: "#64748b" }}>
            Height: {height()}px
            <input
              type="range"
              min="60"
              max="240"
              value={height()}
              onInput={e => setHeight(+e.currentTarget.value)}
              style={{ display: "block", width: "100%" }}
            />
          </label>
        </div>

        <BoundsGrid bounds={bounds} />
      </div>
    );
  },
});

export const ReactiveTarget = meta.story({
  name: "Reactive target",
  parameters: {
    docs: {
      description: {
        story:
          "The `target` argument can be a signal accessor. Set it to a falsy value to pause tracking — bounds values return `null`. Toggle the target below to see the difference.",
      },
    },
  },
  render: () => {
    const [active, setActive] = createSignal(true);
    const [ref, setRef] = createSignal<HTMLDivElement>();

    const bounds = createElementBounds(() => (active() ? ref() : null));

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Reactive target</h3>

        <div
          ref={setRef}
          style={{
            width: "160px",
            height: "80px",
            background: active() ? "#6366f1" : "#94a3b8",
            "border-radius": "8px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            color: "white",
            "font-weight": "600",
            transition: "background 0.2s",
          }}
        >
          {active() ? "Tracked" : "Not tracked"}
        </div>

        <button onClick={() => setActive(a => !a)}>
          {active() ? "Disable tracking" : "Enable tracking"}
        </button>

        <BoundsGrid bounds={bounds} />
      </div>
    );
  },
});

export const ScrollTracking = meta.story({
  name: "Scroll tracking",
  parameters: {
    docs: {
      description: {
        story:
          "`trackScroll` (enabled by default) listens for scroll events on any ancestor and updates `top`, `left`, `right`, and `bottom` as the element moves relative to the viewport. Scroll the container below to see the position values change.",
      },
    },
  },
  render: () => {
    let ref!: HTMLDivElement;
    const bounds = createElementBounds(() => ref);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Scroll tracking</h3>

        <div
          style={{
            height: "180px",
            overflow: "auto",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.5rem",
          }}
        >
          <div style={{ height: "480px", display: "flex", "align-items": "center", "justify-content": "center" }}>
            <div
              ref={ref}
              style={{
                width: "140px",
                height: "70px",
                background: "#10b981",
                "border-radius": "8px",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                color: "white",
                "font-weight": "600",
              }}
            >
              Scroll me
            </div>
          </div>
        </div>

        <BoundsGrid bounds={bounds} />

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          Scroll the container — <code>top</code>, <code>left</code>, <code>bottom</code>, and{" "}
          <code>right</code> reflect the element's position in the viewport.
        </p>
      </div>
    );
  },
});

export const ThrottledTracking = meta.story({
  name: "Throttled updates (UpdateGuard)",
  parameters: {
    docs: {
      description: {
        story:
          "Each tracking option accepts an `UpdateGuard` in place of `true` — a higher-order function `(update) => throttledUpdate` that wraps the internal trigger. Use it to rate-limit expensive recalculations. The counter below only increments at most once every 400ms of scrolling, no matter how many scroll events fire.",
      },
    },
  },
  render: () => {
    const [updateCount, setUpdateCount] = createSignal(0);

    const throttleGuard =
      (ms: number): UpdateGuard =>
      fn => {
        let last = 0;
        return (...args) => {
          const now = Date.now();
          if (now - last < ms) return;
          last = now;
          setUpdateCount(c => c + 1);
          fn(...args);
        };
      };

    let ref!: HTMLDivElement;
    const bounds = createElementBounds(() => ref, {
      trackScroll: throttleGuard(400),
      trackResize: throttleGuard(400),
    });

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>UpdateGuard — throttled tracking</h3>

        <div
          style={{
            height: "160px",
            overflow: "auto",
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
            padding: "0.5rem",
          }}
        >
          <div
            style={{
              height: "400px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
            }}
          >
            <div
              ref={ref}
              style={{
                width: "140px",
                height: "60px",
                background: "#8b5cf6",
                "border-radius": "8px",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                color: "white",
                "font-weight": "600",
              }}
            >
              Scroll me
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
            "font-size": "0.85rem",
          }}
        >
          <span style={{ color: "#64748b" }}>Bounds updates fired</span>
          <strong style={{ "font-variant-numeric": "tabular-nums" }}>{updateCount()}</strong>
        </div>

        <BoundsGrid bounds={bounds} />

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          Pass an <code>UpdateGuard</code> to wrap the internal trigger — throttle, debounce, or
          batch updates any way you like.
        </p>
      </div>
    );
  },
});


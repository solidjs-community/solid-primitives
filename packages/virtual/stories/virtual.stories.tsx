import { createSignal, For, type Accessor } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { VirtualList, createVirtualList } from "@solid-primitives/virtual";
import readme from "../README.md?raw";

const container = {
  "font-family": "system-ui",
  padding: "1.5rem",
  "min-width": "380px",
  display: "flex",
  "flex-direction": "column",
  gap: "1rem",
} as const;

const meta = preview.meta({
  title: "Display & Media/Virtual List",
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

const ALL_ITEMS = Array.from({ length: 10_000 }, (_, i) => ({
  id: i + 1,
  label: `Item #${i + 1}`,
  color: `hsl(${(i * 37) % 360}, 55%, 55%)`,
}));

export const VirtualListComponent = meta.story({
  name: "VirtualList component",
  parameters: {
    docs: {
      description: {
        story:
          "`<VirtualList>` is a drop-in virtualized list component. Only the rows visible in the viewport (plus `overscanCount` above and below) are mounted in the DOM — 10,000 items render as fast as 20. The `children` prop receives an `Accessor<T>` for each visible item.",
      },
    },
  },
  render: () => {
    const [rootHeight, setRootHeight] = createSignal(320);
    const [rowHeight, setRowHeight] = createSignal(48);
    const [overscanCount, setOverscanCount] = createSignal(3);

    const visibleCount = () => Math.ceil(rootHeight() / rowHeight()) + overscanCount() * 2;

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>{"<VirtualList>"} — 10,000 items</h3>

        <div
          style={{
            display: "grid",
            "grid-template-columns": "1fr 1fr 1fr",
            gap: "0.5rem",
            "font-size": "0.82rem",
          }}
        >
          <label style={{ color: "#64748b" }}>
            Container height: {rootHeight()}px
            <input
              type="range"
              min="120"
              max="600"
              value={rootHeight()}
              onInput={e => setRootHeight(+e.currentTarget.value)}
              style={{ display: "block", width: "100%" }}
            />
          </label>
          <label style={{ color: "#64748b" }}>
            Row height: {rowHeight()}px
            <input
              type="range"
              min="24"
              max="96"
              value={rowHeight()}
              onInput={e => setRowHeight(+e.currentTarget.value)}
              style={{ display: "block", width: "100%" }}
            />
          </label>
          <label style={{ color: "#64748b" }}>
            Overscan: {overscanCount()}
            <input
              type="range"
              min="1"
              max="10"
              value={overscanCount()}
              onInput={e => setOverscanCount(+e.currentTarget.value)}
              style={{ display: "block", width: "100%" }}
            />
          </label>
        </div>

        <div
          style={{
            "font-size": "0.8rem",
            color: "#64748b",
            padding: "0.35rem 0.6rem",
            background: "#f1f5f9",
            "border-radius": "4px",
          }}
        >
          ~{visibleCount()} DOM nodes rendered out of 10,000
        </div>

        <VirtualList
          each={ALL_ITEMS}
          rootHeight={rootHeight()}
          rowHeight={rowHeight()}
          overscanCount={overscanCount()}
          fallback={<div style={{ padding: "1rem", color: "#94a3b8" }}>No items</div>}
        >
          {(item: Accessor<(typeof ALL_ITEMS)[number]>) => (
            <div
              style={{
                height: `${rowHeight()}px`,
                display: "flex",
                "align-items": "center",
                "padding-left": "0.75rem",
                gap: "0.6rem",
                "border-bottom": "1px solid #f1f5f9",
                "box-sizing": "border-box",
                width: "340px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  "border-radius": "50%",
                  background: item().color,
                  "flex-shrink": 0,
                }}
              />
              <span style={{ "font-size": "0.85rem", color: "#334155" }}>{item().label}</span>
              <span
                style={{
                  "margin-left": "auto",
                  "padding-right": "0.75rem",
                  "font-size": "0.75rem",
                  color: "#94a3b8",
                  "font-family": "monospace",
                }}
              >
                #{item().id}
              </span>
            </div>
          )}
        </VirtualList>
      </div>
    );
  },
});

export const HeadlessVirtualList = meta.story({
  name: "createVirtualList (headless)",
  parameters: {
    docs: {
      description: {
        story:
          "`createVirtualList` returns a `[virtual, onScroll]` tuple with full control over layout. Use `virtual().containerHeight` for the total scroll height, `virtual().viewerTop` to offset the visible window, and `virtual().visibleItems` to render only what's in view. All config values can be reactive signals.",
      },
    },
  },
  render: () => {
    const ITEMS = Array.from({ length: 5_000 }, (_, i) => `Row ${i + 1}`);

    const [rootHeight] = createSignal(280);
    const [rowHeight] = createSignal(40);

    const [virtual, onScroll] = createVirtualList({
      items: ITEMS,
      rootHeight,
      rowHeight,
      overscanCount: 2,
    });

    const [scrollTop, setScrollTop] = createSignal(0);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createVirtualList — custom layout</h3>

        <div
          style={{
            "font-size": "0.82rem",
            display: "grid",
            "grid-template-columns": "1fr 1fr 1fr",
            gap: "0.5rem",
          }}
        >
          {(
            [
              ["Total items", () => ITEMS.length.toLocaleString()],
              ["Rendered", () => virtual().visibleItems.length],
              ["Scroll offset", () => `${Math.round(scrollTop())}px`],
            ] as const
          ).map(([label, val]) => (
            <div
              style={{
                padding: "0.4rem 0.6rem",
                background: "#f1f5f9",
                "border-radius": "5px",
              }}
            >
              <div style={{ color: "#64748b", "font-size": "0.75rem" }}>{label}</div>
              <strong style={{ "font-variant-numeric": "tabular-nums" }}>{val()}</strong>
            </div>
          ))}
        </div>

        <div
          style={{
            overflow: "auto",
            height: `${rootHeight()}px`,
            border: "1px solid #e2e8f0",
            "border-radius": "8px",
          }}
          onScroll={e => {
            onScroll(e);
            setScrollTop((e.target as HTMLElement).scrollTop);
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: `${virtual().containerHeight}px`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: `${virtual().viewerTop}px`,
                width: "100%",
              }}
            >
              <For each={virtual().visibleItems}>
                {(item: Accessor<string>) => (
                  <div
                    style={{
                      height: `${rowHeight()}px`,
                      display: "flex",
                      "align-items": "center",
                      "padding-left": "0.75rem",
                      "border-bottom": "1px solid #f1f5f9",
                      "box-sizing": "border-box",
                      "font-size": "0.85rem",
                      color: "#334155",
                    }}
                  >
                    {item()}
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          <code>containerHeight</code> sets the scrollable area height. <code>viewerTop</code>{" "}
          offsets the rendered block. Only <code>visibleItems</code> are mounted — scroll to verify.
        </p>
      </div>
    );
  },
});

export const EmptyFallback = meta.story({
  name: "Empty list fallback",
  parameters: {
    docs: {
      description: {
        story:
          "Both `<VirtualList>` and `createVirtualList` handle empty or falsy item lists gracefully. Pass a `fallback` prop to `<VirtualList>` to display placeholder content when the list is empty.",
      },
    },
  },
  render: () => {
    const [showItems, setShowItems] = createSignal(false);
    const items = () => (showItems() ? ALL_ITEMS.slice(0, 20) : []);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Empty list fallback</h3>

        <button onClick={() => setShowItems(s => !s)} style={{ "align-self": "flex-start" }}>
          {showItems() ? "Clear list" : "Load items"}
        </button>

        <VirtualList
          each={items()}
          rootHeight={240}
          rowHeight={44}
          fallback={
            <div
              style={{
                height: "240px",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
                color: "#94a3b8",
                "font-size": "0.9rem",
                border: "1px dashed #e2e8f0",
                "border-radius": "8px",
              }}
            >
              No items — click "Load items" above
            </div>
          }
        >
          {(item: Accessor<(typeof ALL_ITEMS)[number]>) => (
            <div
              style={{
                height: "44px",
                display: "flex",
                "align-items": "center",
                "padding-left": "0.75rem",
                "border-bottom": "1px solid #f1f5f9",
                "box-sizing": "border-box",
                "font-size": "0.85rem",
                color: "#334155",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  "border-radius": "50%",
                  background: item().color,
                }}
              />
              {item().label}
            </div>
          )}
        </VirtualList>
      </div>
    );
  },
});

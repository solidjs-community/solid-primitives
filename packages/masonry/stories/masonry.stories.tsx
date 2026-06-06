import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createMasonry } from "@solid-primitives/masonry";
import readme from "../README.md?raw";
import { Button } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Masonry",
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

// GAP is included in mapHeight so the flex container's gap is accounted for
// in the masonry height calculation.
const GAP = 8;

// Item element height = data.height() - GAP + data.margin()
//   data.height()   → mapHeight return value (item.height + GAP)
//   - GAP           → strips the gap back out so the element is item.height px tall
//   + data.margin() → extra px added to the last item in short columns to fill
//                     the column to the tallest column's height
// Container height  = masonry.height() - GAP (no trailing gap after last item)

export const BasicMasonry = meta.story({
  name: "Basic masonry — 3 columns",
  parameters: {
    docs: {
      description: {
        story:
          "`createMasonry` splits a source array into columns by assigning each item to the shortest column, then sets reactive `order` and `margin` values. Render inside a `flex-direction: column; flex-wrap: wrap` container whose `height` is set to `masonry.height()`. Items need `order` and optionally `margin-bottom` from the layout data.",
      },
    },
  },
  render: () => {
    const COLS = 3;
    const items = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      height: 40 + (i % 5) * 16,
      hue: (i * 41) % 360,
      label: String(i + 1),
    }));

    const masonry = createMasonry({
      source: () => items,
      columns: COLS,
      mapHeight: item => item.height + GAP,
      mapElement: (data, index) => (
        <div
          style={{
            width: `${100 / COLS}%`,
            height: `${data.height() - GAP + data.margin()}px`,
            order: data.order(),
            "box-sizing": "border-box",
            padding: `0 ${GAP / 2}px`,
          }}
        >
          <div
            style={{
              height: "100%",
              background: `hsl(${data.source.hue}, 55%, 62%)`,
              "border-radius": "6px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              color: "white",
              "font-weight": "700",
              "font-size": "0.9rem",
              "font-family": "system-ui",
            }}
          >
            {index() + 1}
          </div>
        </div>
      ),
    });

    return (
      <div style={{ "font-family": "system-ui", display: "flex", "flex-direction": "column", "align-items": "center", gap: "0.75rem" }}>
        <p style={{ margin: 0, "font-size": "0.85rem", color: "#64748b" }}>
          15 items · 3 columns · shortest-column-first packing
        </p>

        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            "flex-wrap": "wrap",
            height: `${masonry.height() - GAP}px`,
            "row-gap": `${GAP}px`,
            width: "480px",
          }}
        >
          {masonry()}
        </div>
      </div>
    );
  },
});

export const InteractiveMasonry = meta.story({
  name: "Interactive masonry — reactive columns + heights",
  parameters: {
    docs: {
      description: {
        story:
          "`columns` and item `height` can both be reactive signals — the layout recalculates automatically. Pass a signal accessor as `columns` to change the column count on the fly. Return an accessor from `mapHeight` for items whose height can change — the masonry re-packs whenever any height signal updates. Click any item to toggle its height; use the slider to change column count.",
      },
    },
  },
  render: () => {
    const [cols, setCols] = createSignal(3);

    const items = Array.from({ length: 15 }, (_, i) => {
      const baseH = 40 + (i % 5) * 16;
      const [height, setHeight] = createSignal(baseH);
      return {
        id: i,
        height,
        toggle: () => setHeight(h => (h === baseH ? baseH + 50 : baseH)),
      };
    });

    const [source, setSource] = createSignal(items);

    const masonry = createMasonry({
      source,
      columns: cols,
      mapHeight: item => item.height,
      mapElement: (data, index) => (
        <div
          style={{
            width: `${100 / cols()}%`,
            height: `${data.height() - GAP + data.margin()}px`,
            order: data.order(),
            "box-sizing": "border-box",
            padding: `0 ${GAP / 2}px`,
            cursor: "pointer",
          }}
          onClick={data.source.toggle}
        >
          <div
            style={{
              height: "100%",
              background: `hsl(${(data.column() * 55 + 210) % 360}, 55%, 60%)`,
              "border-radius": "6px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              color: "white",
              "font-weight": "700",
              "font-size": "0.85rem",
              "font-family": "system-ui",
              transition: "background 0.2s",
            }}
          >
            #{index() + 1}
          </div>
        </div>
      ),
    });

    const shuffle = () => setSource(s => [...s].sort(() => Math.random() - 0.5));

    return (
      <div
        style={{
          "font-family": "system-ui",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            "align-items": "center",
            "flex-wrap": "wrap",
          }}
        >
          <label style={{ "font-size": "0.85rem", color: "#64748b", display: "flex", gap: "0.5rem", "align-items": "center" }}>
            Columns:
            <input
              type="range"
              min="1"
              max="5"
              value={cols()}
              onInput={e => setCols(+e.currentTarget.value)}
            />
            <strong>{cols()}</strong>
          </label>

          <Button onClick={shuffle} variant="secondary">Shuffle</Button>

          <span style={{ "font-size": "0.85rem", color: "#64748b" }}>
            Click items to toggle height · colour = column
          </span>
        </div>

        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            "flex-wrap": "wrap",
            height: `${masonry.height() - GAP}px`,
            "row-gap": `${GAP}px`,
            width: "480px",
          }}
        >
          {masonry()}
        </div>
      </div>
    );
  },
});

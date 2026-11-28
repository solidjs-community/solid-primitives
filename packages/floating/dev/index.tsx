import { type Component, createSignal } from "solid-js";
import { Show } from "@solidjs/web";
import { createFloating, getSizeCssVars, makeAutoUpdate, type Placement } from "../src/index.js";

const placements: Placement[] = [
  "top-start",
  "top",
  "top-end",
  "right-start",
  "right",
  "right-end",
  "bottom-start",
  "bottom",
  "bottom-end",
  "left-start",
  "left",
  "left-end",
];

const App: Component = () => {
  const [reference, setReference] = createSignal<HTMLElement | null>(null);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [arrow, setArrow] = createSignal<HTMLElement | null>(null);
  const [placement, setPlacement] = createSignal<Placement>("bottom");
  const [open, setOpen] = createSignal(true);

  const f = createFloating({
    reference,
    floating,
    placement,
    offset: 10,
    flip: true,
    shift: { padding: 8, limit: true },
    arrow: { element: arrow, padding: 6 },
    whileElementsMounted: makeAutoUpdate,
  });

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center space-y-4 bg-gray-800 p-24 text-white">
      <h4>Floating Primitive</h4>
      <select value={placement()} onChange={e => setPlacement(e.currentTarget.value as Placement)}>
        {placements.map(p => (
          <option value={p}>{p}</option>
        ))}
      </select>
      <button class="btn" ref={setReference} onClick={() => setOpen(o => !o)}>
        Toggle popover
      </button>
      <Show when={open()}>
        <div
          ref={setFloating}
          style={{
            ...f.styles(),
            ...(f.middlewareData() && getSizeCssVars(f.middlewareData()!)),
            "max-height": "var(--available-height)",
            "transform-origin": "var(--transform-origin)",
          }}
          class="rounded bg-white p-4 text-black shadow-lg"
        >
          Placed {f.placement()} {f.middlewareData()?.flipped ? "(flipped)" : ""}
          <div
            ref={setArrow}
            style={{
              position: "absolute",
              width: "10px",
              height: "10px",
              background: "white",
              transform: "rotate(45deg)",
              left: f.middlewareData()?.arrow?.x != null ? `${f.middlewareData()!.arrow!.x}px` : "",
              top: f.middlewareData()?.arrow?.y != null ? `${f.middlewareData()!.arrow!.y}px` : "",
              [f.placement().startsWith("top") ? "bottom" : "top"]: "-5px",
            }}
          />
        </div>
      </Show>
    </div>
  );
};

export default App;

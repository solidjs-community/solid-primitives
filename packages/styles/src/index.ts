import { createSharedRoot } from "@solid-primitives/rootless";
import { Accessor, createSignal, onCleanup } from "solid-js";

const visuallyHiddenStyles: Partial<CSSStyleDeclaration> = {
  border: "0",
  padding: "0",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  position: "absolute",
  whiteSpace: "nowrap",
  overflow: "hidden",
  visibility: "hidden"
};

export const getRemSize = (): number =>
  parseFloat(getComputedStyle(document.documentElement).fontSize);

export function createRemSize(): Accessor<number> {
  const [remSize, setRemSize] = createSignal(getRemSize());
  const el = document.createElement("div");
  el.style.width = "1rem";
  // visually hide the element
  Object.assign(el.style, visuallyHiddenStyles);
  document.body.appendChild(el);
  let init = true;
  const ro = new ResizeObserver(() => {
    if (init) return (init = false);
    setRemSize(getRemSize());
  });
  ro.observe(el);
  onCleanup(() => ro.disconnect());
  return remSize;
}

export const useRemSize: () => Accessor<number> = /*#__PURE__*/ createSharedRoot(createRemSize);

export const setServerRemSize = (size: number): void => {
  // logic is in the server.ts file
};

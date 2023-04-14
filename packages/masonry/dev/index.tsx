import { Component, For, createMemo, createRenderEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import { createMasonryLayout } from "../src";
import { resolveElements } from "@solid-primitives/refs";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import { createBreakpoints } from "@solid-primitives/media";
import { TransitionGroup } from "solid-transition-group";

import "uno.css";

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;

const App: Component = () => {
  const [items, setItems] = createSignal([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ]);

  const br = createBreakpoints({
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  });

  const cols = createMemo(() => {
    if (br.xl) return 6;
    if (br.lg) return 4;
    if (br.md) return 3;
    if (br.sm) return 2;
    return 1;
  });

  const elements = resolveElements(
    () => (
      <For each={items()}>
        {item => {
          const color = getRandomColor();
          const height = Math.floor(Math.random() * 100) + 10 * item;
          return (
            <div
              class="transition-composite center-child rounded p-6 outline-dashed duration-500"
              style={{
                height: `${height}px`,
                width: `calc(${(1 / cols()) * 100}% - ${(cols() - 1) / cols()} * 24px)`,
                background: color,
              }}
            >
              <span class="bg-slate-900 text-2xl font-medium text-gray-100">{item}</span>
            </div>
          );
        }}
      </For>
    ),
    (e): e is HTMLElement => e instanceof HTMLElement,
  );

  const masonry = createMasonryLayout({
    items: elements.toArray,
    mapItem(item, margin) {
      const [height, setHeight] = createSignal(
        item.style.height ? parseInt(item.style.height) : 50,
      );
      // createResizeObserver(item, () => setHeight(item.offsetHeight));
      // createRenderEffect(() => {
      //   item.style.marginBottom = `${margin()}px`;
      // });
      return height;
    },
    columns: cols,
    gap: 24,
  });

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 p-24 text-white">
      <div
        class="w-80vw flex flex-col flex-wrap content-start items-stretch justify-start gap-6"
        style={{ height: `${masonry.height()}px` }}
      >
        {/* {masonry()} */}
        <TransitionGroup name="v-group">{masonry()}</TransitionGroup>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

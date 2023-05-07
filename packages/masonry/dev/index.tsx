import { Component, createMemo, createSignal } from "solid-js";

import { createBreakpoints } from "@solid-primitives/media";
import { createMasonry } from "../src";

const getRandomHeight = () => Math.floor(Math.random() * 300) + 100;

const App: Component = () => {
  const [items, setItems] = createSignal(
    Array.from({ length: 100 }, (_, i) => {
      const [height, setHeight] = createSignal(getRandomHeight());
      return {
        height,
        updateHeight: () => setHeight(getRandomHeight()),
        i,
      };
    }),
  );

  const br = createBreakpoints({
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  });

  const masonry = createMasonry({
    source: items,
    columns: () => {
      if (br.xl) return 6;
      if (br.lg) return 4;
      if (br.md) return 3;
      if (br.sm) return 2;
      return 1;
    },
    mapHeight(item) {
      return () => item.height() + 24;
    },
    mapElement(item, i) {
      const s = Math.random() * 50 + 25;
      const l = Math.random() * 50 + 25;
      return (
        <div
          class="center-child cursor-pointer rounded outline-dashed 
          hover:z-10 hover:scale-105 hover:shadow-lg"
          style={{
            height: `${item.source.height() + item.margin()}px`,
            // "margin-bottom": `${item.margin()}px`,
            // "flex-grow": item.margin() ? 1 : 0,
            order: item.order(),
            background: `hsl(${item.column() * 60}, ${s}%, ${l}%)`,
          }}
          onClick={item.source.updateHeight}
        >
          <span class="bg-slate-900 text-2xl font-medium text-gray-100">
            {item.source.i}_{i()}
          </span>
        </div>
      );
    },
  });

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 p-24 text-white">
      <h1>Masonry Layout</h1>

      <div class="flex flex-row space-x-4">
        <button
          class="btn"
          onClick={() => setItems(p => p.slice().sort(() => Math.random() - 0.5))}
        >
          Shuffle
        </button>
      </div>

      <div
        class="w-80vw flex flex-col flex-wrap items-stretch justify-start gap-6"
        style={{ height: `${masonry.height() - 24}px` }}
      >
        {masonry()}
      </div>
    </div>
  );
};

export default App;

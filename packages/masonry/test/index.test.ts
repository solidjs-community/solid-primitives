import { describe, expect, test } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createMasonry } from "../src/index.js";

describe("createMasonry", () => {
  test("ordering equal items", () => {
    const { dispose, setSource, masonry } = createRoot(dispose => {
      const [source, setSource] = createSignal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const masonry = createMasonry({
        source,
        columns: 3,
        mapHeight: () => 1,
      });
      return { dispose, setSource, masonry };
    });

    expect(masonry().map(i => i.source)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(masonry().map(i => i.order())).toEqual([0, 4, 7, 1, 5, 8, 2, 6, 9, 3]);
    expect(masonry().map(i => i.margin())).toEqual([0, 0, 0, 0, 0, 0, 0, 1, 1, 0]);
    expect(masonry().map(i => i.column())).toEqual([0, 1, 2, 0, 1, 2, 0, 1, 2, 0]);
    expect(masonry.height()).toBe(4);

    setSource([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    expect(masonry().map(i => i.source)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(masonry().map(i => i.order())).toEqual([0, 4, 8, 1, 5, 9, 2, 6, 10, 3, 7]);
    expect(masonry().map(i => i.margin())).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
    expect(masonry().map(i => i.column())).toEqual([0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1]);
    expect(masonry.height()).toBe(4);

    dispose();
  });

  test("filing shortest column first", () => {
    createRoot(dispose => {
      const [source] = createSignal([
        { id: 1, height: 3 },
        { id: 2, height: 2 },
        { id: 3, height: 1 },
        { id: 4, height: 1 },
        { id: 5, height: 2 },
        { id: 6, height: 1 },
      ]);
      const masonry = createMasonry({
        source,
        columns: 3,
        mapHeight: item => item.height,
      });

      /*
      1 2 3
      1 2 4
      1 5 6
      - 5 -
      */

      expect(masonry().map(i => i.source)).toEqual(source());
      expect(masonry().map(i => i.order())).toEqual([
        /* 1 */ 0, /* 2 */ 1, /* 3 */ 3, /* 4 */ 4, /* 5 */ 2, /* 6 */ 5,
      ]);
      expect(masonry().map(i => i.margin())).toEqual([
        /* 1 */ 1, /* 2 */ 0, /* 3 */ 0, /* 4 */ 0, /* 5 */ 0, /* 6 */ 1,
      ]);
      expect(masonry().map(i => i.column())).toEqual([
        /* 1 */ 0, /* 2 */ 1, /* 3 */ 2, /* 4 */ 2, /* 5 */ 1, /* 6 */ 2,
      ]);
      expect(masonry.height()).toBe(4);

      dispose();
    });
  });

  test("mapping items", () => {
    createRoot(dispose => {
      const [source] = createSignal([1, 2, 3, 4, 5, 6]);
      const masonry = createMasonry({
        source,
        columns: 3,
        mapHeight: () => 1,
        mapElement: item => ({
          ...item,
          type: "element",
        }),
      });

      /*
      1 2 3
      4 5 6
      */

      expect(masonry().map(i => i.source)).toEqual(source());
      expect(masonry().map(i => i.order())).toEqual([
        /* 1 */ 0, /* 2 */ 2, /* 3 */ 4, /* 4 */ 1, /* 5 */ 3, /* 6 */ 5,
      ]);
      expect(masonry().map(i => i.margin())).toEqual([0, 0, 0, 0, 0, 0]);
      expect(masonry().map(i => i.column())).toEqual([0, 1, 2, 0, 1, 2]);
      expect(masonry().every(i => i.type === "element")).toBeTruthy();
      expect(masonry.height()).toBe(2);

      dispose();
    });
  });

  test("changing columns", () => {
    createRoot(dispose => {
      const [source] = createSignal([1, 2, 3, 4, 5, 6]);
      const [columns, setColumns] = createSignal(3);
      const masonry = createMasonry({
        source,
        columns,
        mapHeight: () => 1,
      });

      /*
      1 2 3
      4 5 6
      */

      expect(masonry().map(i => i.source)).toEqual(source());
      expect(masonry().map(i => i.order())).toEqual([
        /* 1 */ 0, /* 2 */ 2, /* 3 */ 4, /* 4 */ 1, /* 5 */ 3, /* 6 */ 5,
      ]);
      expect(masonry().map(i => i.margin())).toEqual([0, 0, 0, 0, 0, 0]);
      expect(masonry().map(i => i.column())).toEqual([0, 1, 2, 0, 1, 2]);
      expect(masonry.height()).toBe(2);

      setColumns(2);

      /*
      1 2
      3 4
      5 6
      */

      expect(masonry().map(i => i.source)).toEqual(source());
      expect(masonry().map(i => i.order())).toEqual([
        /* 1 */ 0, /* 2 */ 3, /* 3 */ 1, /* 4 */ 4, /* 5 */ 2, /* 6 */ 5,
      ]);
      expect(masonry().map(i => i.margin())).toEqual([0, 0, 0, 0, 0, 0]);
      expect(masonry().map(i => i.column())).toEqual([0, 1, 0, 1, 0, 1]);
      expect(masonry.height()).toBe(3);

      dispose();
    });
  });
});

import { describe, test, expect } from "vitest";
import { renderToString } from "@solidjs/web";
import { VirtualList } from "../src/index.jsx";

const TEST_LIST = Array.from({ length: 1000 }, (_, i) => i);

describe("VirtualList", () => {
  test("doesn't break in SSR", () => {
    const virtualListStr = renderToString(() => (
      <VirtualList each={TEST_LIST} overscanCount={1} rootHeight={20} rowHeight={10}>
        {item => <div style={{ height: "10px" }}>{item()}</div>}
      </VirtualList>
    ));

    // compilers differ on whether an undefined `class` renders as `class=""` or is omitted
    expect(virtualListStr.replace(' class=""', "")).toEqual(
      [
        '<div style="overflow:auto;height:20px">',
        '  <div style="position:relative;width:100%;height:10000px">',
        '    <div style="position:absolute;top:0px">',
        '      <div style="height:10px">0</div>',
        '      <div style="height:10px">1</div>',
        '      <div style="height:10px">2</div>',
        "    </div>",
        "  </div>",
        "</div>",
      ]
        .map(v => v.trim())
        .join(""),
    );
  });
});

describe("variable and measured modes", () => {
  test("rowHeight function renders in SSR", () => {
    const str = renderToString(() => (
      <VirtualList each={TEST_LIST} rootHeight={30} rowHeight={(i: number) => (i % 2 ? 20 : 10)}>
        {item => <div>{item()}</div>}
      </VirtualList>
    ));
    expect(str).toContain("height:15000px");
    expect(str).toContain(">0<");
    expect(str).toContain(">2<");
  });

  test("measured mode renders estimated layout and measureElement is a no-op", () => {
    const str = renderToString(() => (
      <VirtualList each={TEST_LIST} rootHeight={30} estimatedRowHeight={10}>
        {item => <span>{item()}</span>}
      </VirtualList>
    ));
    expect(str).toContain("height:10000px");
    expect(str).toContain('data-index="0"');
  });
});

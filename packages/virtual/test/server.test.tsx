import { describe, test, expect } from "vitest";
import { renderToString } from "solid-js/web";
import { VirtualList } from "../src/index.jsx";

const TEST_LIST = Array.from({ length: 1000 }, (_, i) => i);

describe("VirtualList", () => {
  test("doesn't break in SSR", () => {
    const virtualListStr = renderToString(() => (
      <VirtualList
        each={TEST_LIST}
        overscanCount={1}
        rootHeight={20}
        rowHeight={10}
        class="classString"
      >
        {item => <div style={{ height: "10px" }}>{item}</div>}
      </VirtualList>
    ));

    expect(virtualListStr).toEqual(
      [
        '<div style="overflow:auto;height:20px" class="classString">',
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

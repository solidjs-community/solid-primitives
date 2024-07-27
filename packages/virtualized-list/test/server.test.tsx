import { describe, test, expect } from "vitest";
import { VirtualList } from "../src/index.js";

import { TEST_LIST, VirtualListItem } from "./helpers.jsx";
import { renderToString } from "solid-js/web";

describe("VirtualList", () => {
  test("doesn't break in SSR", () => {
    const virtualListStr = renderToString(() => (
      <VirtualList
        items={TEST_LIST}
        overscanCount={1}
        renderRow={item => <VirtualListItem item={item} />}
        rootHeight={20}
        rowHeight={10}
        class="classString"
      />
    ));

    expect(virtualListStr).toEqual(
      [
        '<div style="overflow:auto;height:20px" class="classString">',
        '  <div style="position:relative;width:100%;height:10000px">',
        '    <div style="position:absolute;top:0px">',
        '      <div style="height:100px">0</div>',
        '      <div style="height:100px">1</div>',
        '      <div style="height:100px">2</div>',
        "    </div>",
        "  </div>",
        "</div>",
      ]
        .map(v => v.trim())
        .join(""),
    );
  });
});

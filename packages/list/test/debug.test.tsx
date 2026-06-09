import { describe, test, expect } from "vitest";
import { createSignal, flush } from "solid-js";
import { List } from "../src/index.js";
import { render } from "@solidjs/web";

describe("debug", () => {
  test("index signal updates with one flush", () => {
    const container = document.createElement("div");
    const [s, set] = createSignal([1, 2, 3, 4]);

    const callbacks: (() => { v: number; i: number })[] = [];
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => {
            callbacks.push(() => ({ v: v(), i: i() }));
            return <div>{i()}: {v() * 2}</div>;
          }}
        </List>
      ),
      container,
    );

    const domText = () => Array.from(container.childNodes).map(n => n.textContent);
    const cbValues = () => callbacks.map(c => c());

    // Initial state
    expect(cbValues()).toEqual([{ v: 1, i: 0 }, { v: 2, i: 1 }, { v: 3, i: 2 }, { v: 4, i: 3 }]);
    expect(domText()).toEqual(["0: 2", "1: 4", "2: 6", "3: 8"]);

    set([1, 3, 2, 4]); // swap positions of 2 and 3

    // Before flush — callbacks and DOM are still stale
    expect(cbValues()).toEqual([{ v: 1, i: 0 }, { v: 2, i: 1 }, { v: 3, i: 2 }, { v: 4, i: 3 }]);
    expect(domText()).toEqual(["0: 2", "1: 4", "2: 6", "3: 8"]);

    flush();

    // After one flush — index signals updated; callbacks ordered by creation (v:2 was created 2nd)
    expect(cbValues()).toEqual([{ v: 1, i: 0 }, { v: 2, i: 2 }, { v: 3, i: 1 }, { v: 4, i: 3 }]);
    expect(domText()).toEqual(["0: 2", "1: 6", "2: 4", "3: 8"]);

    flush();

    // Second flush — nothing changes
    expect(cbValues()).toEqual([{ v: 1, i: 0 }, { v: 2, i: 2 }, { v: 3, i: 1 }, { v: 4, i: 3 }]);
    expect(domText()).toEqual(["0: 2", "1: 6", "2: 4", "3: 8"]);

    unmount();
  });
});

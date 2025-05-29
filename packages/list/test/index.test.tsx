import { describe, test, expect } from "vitest";
import { createMemo, createRoot, createSignal } from "solid-js";
import { List, listArray } from "../src/index.js";
import { render } from "solid-js/web";

describe("listArray", () => {
  test("simple listArray", () => {
    createRoot(() => {
      const [s] = createSignal([1, 2, 3, 4]),
        r = listArray(s, v => v() * 2);
      expect(r()).toEqual([2, 4, 6, 8]);
    });
  });

  test("show fallback", () => {
    createRoot(() => {
      const [s, set] = createSignal([1, 2, 3, 4]),
        double = listArray<number, number | string>(s, v => v() * 2, {
          fallback: () => "Empty",
        }),
        r = createMemo(double);
      expect(r()).toEqual([2, 4, 6, 8]);
      set([]);
      expect(r()).toEqual(["Empty"]);
      set([3, 4, 5]);
      expect(r()).toEqual([6, 8, 10]);
    });
  });
});

describe("List", () => {
  test("simple", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const startingArray = [1, 2, 3, 4];
    const [s] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => (
            <div>
              {i()}: {v() * 2}
            </div>
          )}
        </List>
      ),
      container,
    );

    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${startingArray[k]! * 2}`);
    });

    unmount();
    document.body.removeChild(container);
  });

  test("doesn't change for same values", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => (
            <div>
              {i()}: {v() * 2}
            </div>
          )}
        </List>
      ),
      container,
    );

    const oldMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${startingArray[k]! * 2}`);
      oldMapped[k] = v;
    });

    set([...startingArray]);

    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${startingArray[k]! * 2}`);
      expect(oldMapped[k]).toBe(v);
    });

    unmount();
    document.body.removeChild(container);
  });

  test("reorders elements", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => (
            <div>
              {i()}: {v() * 2}
            </div>
          )}
        </List>
      ),
      container,
    );

    const oldMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${startingArray[k]! * 2}`);
      oldMapped[k] = v;
    });

    const nextArray = [1, 3, 2, 4];
    set(nextArray);

    const newMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${nextArray[k]! * 2}`);
      newMapped[k] = v;
    });

    expect(oldMapped[0]).toBe(newMapped[0]);
    expect(oldMapped[1]).toBe(newMapped[2]);
    expect(oldMapped[2]).toBe(newMapped[1]);
    expect(oldMapped[3]).toBe(newMapped[3]);

    unmount();
    document.body.removeChild(container);
  });

  test("changes value of elements", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => (
            <div>
              {i()}: {v() * 2}
            </div>
          )}
        </List>
      ),
      container,
    );

    const oldMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${startingArray[k]! * 2}`);
      oldMapped[k] = v;
    });

    const nextArray = [1, 5, 3, 6];
    set(nextArray);

    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${nextArray[k]! * 2}`);
      expect(oldMapped[k]).toBe(v);
    });

    unmount();
    document.body.removeChild(container);
  });

  test("reorders elements with value change", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => (
            <div>
              {i()}: {v() * 2}
            </div>
          )}
        </List>
      ),
      container,
    );

    const oldMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${startingArray[k]! * 2}`);
      oldMapped[k] = v;
    });

    const nextArray = [1, 2, 4, 5];
    set(nextArray);

    const newMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${nextArray[k]! * 2}`);
      newMapped[k] = v;
    });

    expect(oldMapped[0]).toBe(newMapped[0]);
    expect(oldMapped[1]).toBe(newMapped[1]);
    expect(oldMapped[2]).toBe(newMapped[3]);
    expect(oldMapped[3]).toBe(newMapped[2]);

    unmount();
    document.body.removeChild(container);
  });

  test("creates new elements", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => (
            <div>
              {i()}: {v() * 2}
            </div>
          )}
        </List>
      ),
      container,
    );

    const oldMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${startingArray[k]! * 2}`);
      oldMapped[k] = v;
    });

    const nextArray = [1, 2, 10, 11, 3, 4];
    set(nextArray);

    const newMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${nextArray[k]! * 2}`);
      newMapped[k] = v;
    });

    expect(oldMapped[0]).toBe(newMapped[0]);
    expect(oldMapped[1]).toBe(newMapped[1]);
    expect(oldMapped[2]).toBe(newMapped[4]);
    expect(oldMapped[3]).toBe(newMapped[5]);
    expect(oldMapped.includes(newMapped[2]!)).toEqual(false);
    expect(oldMapped.includes(newMapped[3]!)).toEqual(false);

    unmount();
    document.body.removeChild(container);
  });

  test("deletes unused elements", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => (
            <div>
              {i()}: {v() * 2}
            </div>
          )}
        </List>
      ),
      container,
    );

    const oldMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${startingArray[k]! * 2}`);
      oldMapped[k] = v;
    });

    const nextArray = [1, 4];
    set(nextArray);

    const newMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${nextArray[k]! * 2}`);
      newMapped[k] = v;
    });

    expect(oldMapped[0]).toBe(newMapped[0]);
    expect(oldMapped[3]).toBe(newMapped[1]);
    expect(newMapped.includes(oldMapped[1]!)).toEqual(false);
    expect(newMapped.includes(oldMapped[2]!)).toEqual(false);

    unmount();
    document.body.removeChild(container);
  });

  test("later used signal reports correct values", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const startingArray = [1, 2, 3];
    const [s, set] = createSignal(startingArray);
    const callbacks: (() => { v: number; i: number })[] = [];
    const unmount = render(
      () => (
        <List each={s()}>
          {(v, i) => {
            // this could be event callback (eg. onClick), v & i read only later
            function futureAction() {
              return {
                v: v(),
                i: i(),
              };
            }
            callbacks.push(() => futureAction());

            return <div>No signals used in this fn</div>;
          }}
        </List>
      ),
      container,
    );

    set([2, 1, 4]); // swap 1,2 & replace 3 with 4 (swap for index update, replace for value update)

    // get entries, sort by index & check values in order
    const values = callbacks
      .map(x => x())
      .sort((a, b) => a.i - b.i)
      .map(x => x.v);

    expect(values).toStrictEqual([2, 1, 4]);

    unmount();
    document.body.removeChild(container);
  });
});

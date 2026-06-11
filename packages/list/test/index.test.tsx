import { describe, test, expect } from "vitest";
import { createMemo, createRoot, createSignal, flush } from "solid-js";
import { List, listArray } from "../src/index.js";
import { render } from "@solidjs/web";

describe("listArray", () => {
  test("simple listArray", () => {
    const [s] = createSignal([1, 2, 3, 4]);
    const [dispose, r] = createRoot(dispose => {
      const r = listArray(s, v => v() * 2, { recycle: true });
      return [dispose, r] as const;
    });
    expect(r()).toEqual([2, 4, 6, 8]);
    dispose();
  });

  test("show fallback", () => {
    const [s, set] = createSignal([1, 2, 3, 4]);
    const [dispose, r] = createRoot(dispose => {
      const double = listArray<number, number | string>(s, v => v() * 2, {
        fallback: () => "Empty",
        recycle: true,
      });
      const r = createMemo(double);
      return [dispose, r] as const;
    });

    expect(r()).toEqual([2, 4, 6, 8]);
    set([]);
    flush();
    expect(r()).toEqual(["Empty"]);
    set([3, 4, 5]);
    flush();
    expect(r()).toEqual([6, 8, 10]);
    dispose();
  });
});

describe("List", () => {
  test("simple", () => {
    const container = document.createElement("div");

    const startingArray = [1, 2, 3, 4];
    const [s] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()} recycle>
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
  });

  test("doesn't change for same values", () => {
    const container = document.createElement("div");

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()} recycle>
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
    flush();

    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${startingArray[k]! * 2}`);
      expect(oldMapped[k]).toBe(v);
    });

    unmount();
  });

  test("reorders elements", () => {
    const container = document.createElement("div");

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()} recycle>
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
    flush(); // apply batched index setter writes

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
  });

  test("changes value of elements", () => {
    const container = document.createElement("div");

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()} recycle>
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
    flush(); // apply batched value setter writes

    container.childNodes.forEach((v, k) => {
      expect(v.textContent).toEqual(`${k}: ${nextArray[k]! * 2}`);
      expect(oldMapped[k]).toBe(v);
    });

    unmount();
  });

  test("reorders elements with value change", () => {
    const container = document.createElement("div");

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()} recycle>
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
    flush(); // apply batched value/index setter writes

    const newMapped: ChildNode[] = new Array(container.childNodes.length);
    container.childNodes.forEach((v, k) => {
      // expect(v.textContent).toEqual(`${k}: ${nextArray[k]! * 2}`);
      newMapped[k] = v;
    });

    expect(oldMapped[0]).toBe(newMapped[0]);
    expect(oldMapped[1]).toBe(newMapped[1]);
    expect(oldMapped[2]).toBe(newMapped[3]);
    expect(oldMapped[3]).toBe(newMapped[2]);

    unmount();
  });

  test("creates new elements", () => {
    const container = document.createElement("div");

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()} recycle>
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
    flush(); // apply batched index setter writes for reused elements

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
  });

  test("deletes unused elements", () => {
    const container = document.createElement("div");

    const startingArray = [1, 2, 3, 4];
    const [s, set] = createSignal(startingArray);
    const unmount = render(
      () => (
        <List each={s()} recycle>
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
    flush(); // apply batched index setter writes for reused elements

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
  });

  test("later used signal reports correct values", () => {
    const container = document.createElement("div");

    const startingArray = [1, 2, 3];
    const [s, set] = createSignal(startingArray);
    const callbacks: (() => { v: number; i: number })[] = [];
    const unmount = render(
      () => (
        <List each={s()} recycle>
          {(v, i) => {
            // this could be event callback (eg. onClick), v & i read only later
            callbacks.push(() => ({ v: v(), i: i() }));

            return null;
          }}
        </List>
      ),
      container,
    );

    set([2, 1, 4]); // swap 1,2 & replace 3 with 4 (swap for index update, replace for value update)
    flush(); // trigger list recomputation, queue value/index setter writes

    // get entries, sort by index & check values in order
    const values = callbacks
      .map(x => x())
      .sort((a, b) => a.i - b.i)
      .map(x => x.v);

    expect(values).toStrictEqual([2, 1, 4]);

    unmount();
  });
});

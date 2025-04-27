import { expect, describe, it } from "vitest";
import { createComputed, createRoot, createSignal, onCleanup } from "solid-js";
import { Repeat, repeat } from "../src/index.js";

describe("repeat", () => {
  it("maps only added items", () =>
    createRoot(dispose => {
      const [length, setLength] = createSignal(5);
      let captured: number[] = [];
      const mapped = repeat(length, i => {
        captured.push(i);
        return i;
      });
      expect(mapped(), "initial mapped").toEqual([0, 1, 2, 3, 4]);
      expect(captured, "initial captured").toEqual([0, 1, 2, 3, 4]);
      setLength(7);
      expect(mapped(), "1 mapped").toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(captured, "1 captured").toEqual([0, 1, 2, 3, 4, 5, 6]);
      setLength(3);
      expect(mapped(), "2 mapped").toEqual([0, 1, 2]);
      expect(captured, "2 captured").toEqual([0, 1, 2, 3, 4, 5, 6]);
      setLength(5);
      expect(mapped(), "3 mapped").toEqual([0, 1, 2, 3, 4]);
      expect(captured, "3 captured").toEqual([0, 1, 2, 3, 4, 5, 6, 3, 4]);
      dispose();
    }));

  it("uses fallback if length is 0", () =>
    createRoot(dispose => {
      const [length, setLength] = createSignal(4);
      let captured: (string | number)[] = [];
      const mapped = repeat<string | number>(
        length,
        i => {
          captured.push(i);
          return i;
        },
        {
          fallback: () => {
            captured.push("fb");
            return "fb";
          },
        },
      );
      expect(mapped(), "initial mapped").toEqual([0, 1, 2, 3]);
      expect(captured, "initial captured").toEqual([0, 1, 2, 3]);
      setLength(0);
      expect(mapped(), "1 mapped").toEqual(["fb"]);
      expect(captured, "1 captured").toEqual([0, 1, 2, 3, "fb"]);
      setLength(3);
      expect(mapped(), "2 mapped").toEqual([0, 1, 2]);
      expect(captured, "2 captured").toEqual([0, 1, 2, 3, "fb", 0, 1, 2]);
      dispose();
    }));

  it("disposing on remove and cleanup", () =>
    createRoot(dispose => {
      const [length, setLength] = createSignal(2);
      let cleanups: (string | number)[] = [];
      const mapped = repeat<string | number>(
        length,
        i => {
          onCleanup(() => cleanups.push(i));
          return i;
        },
        {
          fallback: () => {
            onCleanup(() => cleanups.push("fb"));
            return "fb";
          },
        },
      );
      // cleanups happen on access
      createComputed(mapped);
      expect(cleanups, "initial cleanups").toEqual([]);
      setLength(1);
      expect(cleanups, "1 cleanups").toEqual([1]);
      setLength(0);
      expect(cleanups, "2 cleanups").toEqual([1, 0]);
      dispose();
      expect(cleanups, "3 cleanups").toEqual([1, 0, "fb"]);
      setLength(3);
      expect(mapped(), "mapped after dispose").toEqual(["fb"]);
    }));

  it("uses fallback when length is initially 0", () =>
    createRoot(disposer => {
      const map = repeat(
        () => 0,
        i => i,
        { fallback: () => NaN },
      );
      expect(map()).toEqual([NaN]);
      disposer();
    }));
});

describe("<Repeat/>", () => {
  it("notifies observers on length change", () => {
    const [length, setLength] = createSignal(3);

    const [dispose, accessor] = createRoot(dispose => {
      const accessor = Repeat({
        get times() {
          return length();
        },
        fallback: () => 0,
        children: () => 1,
      }) as never as () => {};
      return [dispose, accessor];
    });

    let notifications = 0;
    createComputed(() => {
      accessor();
      notifications++;
    });

    expect(notifications).toEqual(1);
    setLength(4);
    expect(notifications).toEqual(2);
    setLength(0);
    expect(notifications).toEqual(3);
    setLength(2);
    expect(notifications).toEqual(4);
    setLength(1);
    expect(notifications).toEqual(5);
    setLength(1.5);
    expect(notifications).toEqual(5);

    dispose();
  });
});

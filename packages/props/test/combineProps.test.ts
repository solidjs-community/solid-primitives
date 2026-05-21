import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal, flush, merge } from "solid-js";
import { combineProps, combineHandlers } from "../src/index.js";

describe("combineProps", () => {
  it("handles one argument", () =>
    createRoot(dispose => {
      const onClick = () => {};
      const className = "primary";
      const id = "test_id";

      const combinedProps = combineProps({ onClick, className, id });

      expect(combinedProps.onClick).toBe(onClick);
      expect(combinedProps.className).toBe(className);
      expect(combinedProps.id).toBe(id);

      dispose();
    }));

  it("combines handlers", () => {
    createRoot(dispose => {
      const mockFn = vi.fn();
      const message1 = "click1";
      const message2 = "click2";
      const message3 = "click3";

      const combinedProps = combineProps(
        { onEvent: () => mockFn(message1) },
        { onEvent: () => mockFn(message2) },
        { onEvent: () => mockFn(message3) },
      );

      combinedProps.onEvent();

      expect(mockFn).toBeCalledTimes(3);
      expect(mockFn).toHaveBeenNthCalledWith(1, message1);
      expect(mockFn).toHaveBeenNthCalledWith(2, message2);
      expect(mockFn).toHaveBeenNthCalledWith(3, message3);

      dispose();
    });
  });

  it("calls handlers in reverse", () => {
    createRoot(dispose => {
      const mockFn = vi.fn();
      const message1 = "click1";
      const message2 = "click2";
      const message3 = "click3";

      const combinedProps = combineProps(
        [
          { onEvent: () => mockFn(message1) },
          { onEvent: () => mockFn(message2) },
          { onEvent: () => mockFn(message3) },
        ],
        { reverseEventHandlers: true },
      );

      combinedProps.onEvent();

      expect(mockFn).toBeCalledTimes(3);
      expect(mockFn).toHaveBeenNthCalledWith(1, message3);
      expect(mockFn).toHaveBeenNthCalledWith(2, message2);
      expect(mockFn).toHaveBeenNthCalledWith(3, message1);

      dispose();
    });
  });

  it("event handlers can be overwritten", () => {
    createRoot(dispose => {
      const mockFn = vi.fn();
      const message1 = "click1";
      const message2 = "click2";
      const message3 = "click3";

      const combinedProps = combineProps(
        { onEvent: () => mockFn(message1) },
        { onEvent: () => mockFn(message2) },
        { onEvent: "should ignore this" },
        { onEvent: () => mockFn(message3) },
      );

      combinedProps.onEvent();

      expect(mockFn).toBeCalledTimes(1);
      expect(mockFn).toHaveBeenNthCalledWith(1, message3);

      dispose();
    });
  });

  it("last value overwrites the event-listeners", () => {
    createRoot(dispose => {
      const mockFn = vi.fn();
      const message1 = "click1";
      const message2 = "click2";

      const combinedProps = combineProps(
        { onEvent: () => mockFn(message1) },
        { onEvent: () => mockFn(message2) },
        { onEvent: "overwrites" },
        {},
      );

      expect(combinedProps.onEvent).toBe("overwrites");

      dispose();
    });
  });

  it("handles tuples as event handlers", () =>
    createRoot(dispose => {
      const mockFn = vi.fn();
      const message1 = "click1";
      const message2 = "click2";
      const message3 = "click3";

      const combinedProps = combineProps(
        { onClick: () => mockFn(message1) },
        { onClick: [mockFn, message2] },
        { onClick: [mockFn, message3] },
      );

      (combinedProps as any).onClick();

      expect(mockFn).toBeCalledTimes(3);
      expect(mockFn).toHaveBeenNthCalledWith(1, message1);
      expect(mockFn).toHaveBeenNthCalledWith(2, message2);
      expect(mockFn).toHaveBeenNthCalledWith(3, message3);

      dispose();
    }));

  it("merges props with different keys", () => {
    createRoot(dispose => {
      const mockFn = vi.fn();
      const click1 = "click1";
      const click2 = "click2";
      const hover = "hover";
      const focus = "focus";
      const margin = 2;

      const combinedProps = combineProps(
        { onClick: () => mockFn(click1) },
        { onHover: () => mockFn(hover), styles: { margin } },
        { onClick: () => mockFn(click2), onFocus: () => mockFn(focus) },
      );

      combinedProps.onClick();

      expect(mockFn).toBeCalledTimes(2);
      expect(mockFn).toHaveBeenNthCalledWith(1, click1);
      expect(mockFn).toHaveBeenNthCalledWith(2, click2);

      combinedProps.onFocus();

      expect(mockFn).toHaveBeenLastCalledWith(focus);

      combinedProps.onHover();

      expect(mockFn).toHaveBeenLastCalledWith(hover);
      expect(mockFn).toBeCalledTimes(4);
      expect(combinedProps.styles.margin).toBe(margin);

      dispose();
    });
  });

  it("combines css classes", () => {
    createRoot(dispose => {
      const className1 = "primary";
      const className2 = "hover";
      const className3 = "focus";

      const combinedProps = combineProps(
        { class: className1 },
        { class: className2 },
        { class: className3 },
      );

      expect(combinedProps.class).toBe("primary hover focus");

      const combinedProps2 = combineProps(
        { className: className1 },
        { className: className2 },
        { className: className3 },
      );

      expect(combinedProps2.className).toBe("primary hover focus");

      dispose();
    });
  });

  it("combines css class objects", () => {
    createRoot(dispose => {
      const classObj1 = { primary: true, outline: true, compact: true };
      const classObj2 = { large: true, compact: false };

      const combinedProps = combineProps({ class: classObj1 }, { class: classObj2 });

      expect(combinedProps.class).toEqual([classObj1, classObj2]);

      dispose();
    });
  });

  it("combines styles", () =>
    createRoot(dispose => {
      const stringStyles = `
      margin: 24px;;;
        padding:2;
        background-image: url('http://example.com/image.png');
        border: 1px solid #123456 ;
        --x:  123
        `;
      const objStyles = {
        margin: "10px",
        "font-size": "2rem",
      };

      const combinedProps = combineProps({ style: stringStyles }, { style: objStyles });

      expect(combinedProps.style).toEqual({
        margin: "10px",
        padding: "2",
        "background-image": "url('http://example.com/image.png')",
        border: "1px solid #123456 ",
        "--x": "123\n        ",
        "font-size": "2rem",
      });

      dispose();
    }));

  it("combines refs", () =>
    createRoot(dispose => {
      let ref1!: HTMLButtonElement;
      let ref2!: HTMLButtonElement;

      const props1 = {
        ref: (el => (ref1 = el)) as HTMLButtonElement | ((el: HTMLButtonElement) => void),
      };

      const props2 = {
        ref: (el => (ref2 = el)) as HTMLButtonElement | ((el: HTMLButtonElement) => void),
      };

      const combinedProps = combineProps(props1, props2);

      const el = document.createElement("button");
      (combinedProps.ref as any)(el);

      expect(ref1).toBe(el);
      expect(ref2).toBe(el);

      dispose();
    }));

  it("works with merge", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const combined = combineProps({ onClick: cb1 }, { onClick: cb2 });
    const merged = merge(combined);

    merged.onClick("foo");

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb1).toBeCalledWith("foo");
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb2).toBeCalledWith("foo");
  });

  it("accepts function sources", () => {
    const [signal, setSignal] = createSignal<any>({
      class: "primary",
      style: {
        margin: "10px",
      },
    });

    let combinedProps: any;
    createRoot(() => {
      combinedProps = combineProps(
        signal,
        { class: "secondary" },
        { style: { padding: "10px" } },
      );

      expect(combinedProps.class).toBe("primary secondary");
      expect(combinedProps.style).toEqual({ margin: "10px", padding: "10px" });
    });

    setSignal({ class: "tertiary", foo: "bar" });
    flush();

    expect(combinedProps.class).toBe("tertiary secondary");
    expect(combinedProps.style).toEqual({ padding: "10px" });
    expect(combinedProps.foo).toBe("bar");
  });
});

describe("combineHandlers", () => {
  it("chains handlers left-to-right", () => {
    const order: number[] = [];
    const combined = combineHandlers(
      () => order.push(1),
      () => order.push(2),
      () => order.push(3),
    )!;
    combined();
    expect(order).toEqual([1, 2, 3]);
  });

  it("passes all arguments to every handler", () => {
    const mock1 = vi.fn();
    const mock2 = vi.fn();
    const combined = combineHandlers(mock1, mock2)!;
    combined("a", "b");
    expect(mock1).toHaveBeenCalledWith("a", "b");
    expect(mock2).toHaveBeenCalledWith("a", "b");
  });

  it("skips null, undefined, and false", () => {
    const mock = vi.fn();
    const combined = combineHandlers(null, undefined, false, mock, undefined)!;
    combined("arg");
    expect(mock).toHaveBeenCalledOnce();
    expect(mock).toHaveBeenCalledWith("arg");
  });

  it("supports conditional handlers", () => {
    const mock1 = vi.fn();
    const mock2 = vi.fn();

    const inactive = combineHandlers(mock1, false ? mock2 : null)!;
    inactive("x");
    expect(mock1).toHaveBeenCalledWith("x");
    expect(mock2).not.toHaveBeenCalled();

    const active = combineHandlers(mock1, mock2)!;
    active("y");
    expect(mock2).toHaveBeenCalledWith("y");
  });

  it("returns undefined when all handlers are absent", () => {
    expect(combineHandlers(null, undefined, false)).toBeUndefined();
  });

  it("returns the single handler unchanged (no wrapping)", () => {
    const fn = vi.fn();
    expect(combineHandlers(fn)).toBe(fn);
  });
});

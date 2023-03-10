import { describe, it, expect, vi } from "vitest";
import { createComputed, createRoot, createSignal, mergeProps } from "solid-js";
import { spy } from "nanospy";
import { combineProps } from "../src";

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

  it("combines handlers", async () => {
    createRoot(async dispose => {
      const mockFn = spy();
      const message1 = "click1";
      const message2 = "click2";
      const message3 = "click3";

      const combinedProps = combineProps(
        { onEvent: () => mockFn(message1) },
        { onEvent: () => mockFn(message2) },
        { onEvent: () => mockFn(message3) },
      );

      combinedProps.onEvent();

      expect(mockFn.callCount).toBe(3);
      expect(mockFn.calls).toEqual([[message1], [message2], [message3]]);

      dispose();
    });
  });

  it("calls handlers in reverse", () => {
    createRoot(dispose => {
      const mockFn = spy();
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

      expect(mockFn.callCount).toBe(3);
      expect(mockFn.calls).toEqual([[message3], [message2], [message1]]);

      dispose();
    });
  });

  it("event handlers can be overwritten", async () => {
    createRoot(async dispose => {
      const mockFn = spy();
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

      expect(mockFn.callCount).toBe(1);
      expect(mockFn.calls).toEqual([[message3]]);

      dispose();
    });
  });

  it("last value overwrites the event-listeners", async () => {
    createRoot(async dispose => {
      const mockFn = spy();
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
      const mockFn = spy();
      const message1 = "click1";
      const message2 = "click2";
      const message3 = "click3";

      const combinedProps = combineProps(
        { onClick: () => mockFn(message1) },
        { onClick: [mockFn, message2] },
        { onClick: [mockFn, message3] },
      );

      (combinedProps as any).onClick();

      expect(mockFn.callCount).toBe(3);
      expect(mockFn.calls).toEqual([[message1], [message2], [message3]]);

      dispose();
    }));

  it("merges props with different keys", async () => {
    createRoot(async dispose => {
      const mockFn = spy();
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

      expect(mockFn.calls).toEqual([[click1], [click2]]);

      combinedProps.onFocus();

      expect(mockFn.calls[2]).toEqual([focus]);

      combinedProps.onHover();

      expect(mockFn.calls[3]).toEqual([hover]);
      expect(mockFn.callCount).toEqual(4);
      expect(combinedProps.styles.margin).toBe(margin);

      dispose();
    });
  });

  it("combines css classes", async () => {
    createRoot(async dispose => {
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

  it("combines css classList", async () => {
    createRoot(async dispose => {
      const classList1 = {
        primary: true,
        outline: true,
        compact: true,
      };

      const classList2 = {
        large: true,
        compact: false,
      };

      const combinedProps = combineProps({ classList: classList1 }, { classList: classList2 });

      expect(combinedProps.classList).toEqual({
        primary: true,
        outline: true,
        large: true,
        compact: false,
      });

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

  it("works with mergeProps", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const combined = combineProps({ onClick: cb1 }, { onClick: cb2 });
    const merged = mergeProps(combined);

    merged.onClick("foo");

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb1).toBeCalledWith("foo");
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb2).toBeCalledWith("foo");
  });

  it("accepts function sources", () => {
    createRoot(() => {
      const [signal, setSignal] = createSignal<any>({
        class: "primary",
        style: {
          margin: "10px",
        },
      });

      const combinedProps = combineProps(
        signal,
        { class: "secondary" },
        { style: { padding: "10px" } },
      );

      let i = 0;

      createComputed(() => {
        if (i === 0) {
          expect(combinedProps.class).toBe("primary secondary");
          expect(combinedProps.style).toEqual({
            margin: "10px",
            padding: "10px",
          });
          i++;
        } else {
          expect(combinedProps.class).toBe("tertiary secondary");
          expect(combinedProps.style).toEqual({ padding: "10px" });
          expect(combinedProps.foo).toEqual("bar");
        }
      });

      setSignal({ class: "tertiary", foo: "bar" });
    });
  });
});

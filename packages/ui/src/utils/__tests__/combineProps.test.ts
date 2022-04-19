import clsx from "clsx";
import { createRoot } from "solid-js";

import { combineProps } from "..";

describe("combineProps", () => {
  it("handles one argument", async () => {
    createRoot(async dispose => {
      const onClick = jest.fn();
      const className = "primary";
      const id = "test_id";

      const combinedProps = combineProps({ onClick, className, id });

      expect(combinedProps.onClick).toBe(onClick);
      expect(combinedProps.className).toBe(className);
      expect(combinedProps.id).toBe(id);

      dispose();
    });
  });

  it("combines handlers", async () => {
    createRoot(async dispose => {
      const mockFn = jest.fn();
      const message1 = "click1";
      const message2 = "click2";
      const message3 = "click3";

      const combinedProps = combineProps(
        { onClick: () => mockFn(message1) },
        { onClick: () => mockFn(message2) },
        { onClick: () => mockFn(message3) }
      );

      combinedProps.onClick();

      expect(mockFn).toHaveBeenNthCalledWith(1, message1);
      expect(mockFn).toHaveBeenNthCalledWith(2, message2);
      expect(mockFn).toHaveBeenNthCalledWith(3, message3);
      expect(mockFn).toHaveBeenCalledTimes(3);

      dispose();
    });
  });

  it("merges props with different keys", async () => {
    createRoot(async dispose => {
      const mockFn = jest.fn();
      const click1 = "click1";
      const click2 = "click2";
      const hover = "hover";
      const focus = "focus";
      const margin = 2;

      const combinedProps = combineProps(
        { onClick: () => mockFn(click1) },
        { onHover: () => mockFn(hover), styles: { margin } },
        { onClick: () => mockFn(click2), onFocus: () => mockFn(focus) }
      );

      combinedProps.onClick();

      expect(mockFn).toHaveBeenNthCalledWith(1, click1);
      expect(mockFn).toHaveBeenNthCalledWith(2, click2);

      combinedProps.onFocus();

      expect(mockFn).toHaveBeenNthCalledWith(3, focus);

      combinedProps.onHover();

      expect(mockFn).toHaveBeenNthCalledWith(4, hover);
      expect(mockFn).toHaveBeenCalledTimes(4);
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
        { class: className3 }
      );

      const expectedCombinedClassNames = clsx(className1, className2, className3);

      expect(combinedProps.class).toBe(expectedCombinedClassNames);

      dispose();
    });
  });
});

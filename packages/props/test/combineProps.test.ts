import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { spy } from "nanospy";
import { combineProps } from "../src";

const test = suite("combineProps");

test("handles one argument", () =>
  createRoot(dispose => {
    const onClick = () => {};
    const className = "primary";
    const id = "test_id";

    const combinedProps = combineProps({ onClick, className, id });

    assert.is(combinedProps.onClick, onClick);
    assert.is(combinedProps.className, className);
    assert.is(combinedProps.id, id);

    dispose();
  }));

test("combines handlers", async () => {
  createRoot(async dispose => {
    const mockFn = spy();
    const message1 = "click1";
    const message2 = "click2";
    const message3 = "click3";

    const combinedProps = combineProps(
      { onEvent: () => mockFn(message1) },
      { onEvent: () => mockFn(message2) },
      { onEvent: () => mockFn(message3) }
    );

    combinedProps.onEvent();

    assert.is(mockFn.callCount, 3);
    assert.equal(mockFn.calls, [[message1], [message2], [message3]]);

    dispose();
  });
});

test("event handlers can be overwritten", async () => {
  createRoot(async dispose => {
    const mockFn = spy();
    const message1 = "click1";
    const message2 = "click2";
    const message3 = "click3";

    const combinedProps = combineProps(
      { onEvent: () => mockFn(message1) },
      { onEvent: () => mockFn(message2) },
      { onEvent: "should ignore this" },
      { onEvent: () => mockFn(message3) }
    );

    combinedProps.onEvent();

    assert.is(mockFn.callCount, 1);
    assert.equal(mockFn.calls, [[message3]]);

    dispose();
  });
});

test("last value overwrites the event-listeners", async () => {
  createRoot(async dispose => {
    const mockFn = spy();
    const message1 = "click1";
    const message2 = "click2";

    const combinedProps = combineProps(
      { onEvent: () => mockFn(message1) },
      { onEvent: () => mockFn(message2) },
      { onEvent: "overwrites" },
      {}
    );

    assert.is(combinedProps.onEvent, "overwrites");

    dispose();
  });
});

test("handles tuples as event handlers", () =>
  createRoot(dispose => {
    const mockFn = spy();
    const message1 = "click1";
    const message2 = "click2";
    const message3 = "click3";

    const combinedProps = combineProps(
      { onClick: () => mockFn(message1) },
      { onClick: [mockFn, message2] },
      { onClick: [mockFn, message3] }
    );

    combinedProps.onClick();

    assert.is(mockFn.callCount, 3);
    assert.equal(mockFn.calls, [[message1], [message2], [message3]]);

    dispose();
  }));

test("merges props with different keys", async () => {
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
      { onClick: () => mockFn(click2), onFocus: () => mockFn(focus) }
    );

    combinedProps.onClick();

    assert.equal(mockFn.calls, [[click1], [click2]]);

    combinedProps.onFocus();

    assert.equal(mockFn.calls[2], [focus]);

    combinedProps.onHover();

    assert.equal(mockFn.calls[3], [hover]);
    assert.equal(mockFn.callCount, 4);
    assert.is(combinedProps.styles.margin, margin);

    dispose();
  });
});

test("combines css classes", async () => {
  createRoot(async dispose => {
    const className1 = "primary";
    const className2 = "hover";
    const className3 = "focus";

    const combinedProps = combineProps(
      { class: className1 },
      { class: className2 },
      { class: className3 }
    );

    assert.is(combinedProps.class, "primary hover focus");

    const combinedProps2 = combineProps(
      { className: className1 },
      { className: className2 },
      { className: className3 }
    );

    assert.is(combinedProps2.className, "primary hover focus");

    dispose();
  });
});

test("combines css classList", async () => {
  createRoot(async dispose => {
    const classList1 = {
      primary: true,
      outline: true,
      compact: true
    };

    const classList2 = {
      large: true,
      compact: false
    };

    const combinedProps = combineProps({ classList: classList1 }, { classList: classList2 });

    assert.equal(combinedProps.classList, {
      primary: true,
      outline: true,
      large: true,
      compact: false
    });

    dispose();
  });
});

test("combines styles", () =>
  createRoot(dispose => {
    const stringStyles = `
    margin: 24px;;;
      padding:2;
      background-color: red;
      border: 1px solid #123456 ;
      --x:  123
      `;
    const objStyles = {
      margin: "10px",
      "font-size": "2rem"
    };

    const combinedProps = combineProps({ style: stringStyles }, { style: objStyles });

    assert.equal(combinedProps.style, {
      margin: "10px",
      padding: "2",
      "background-color": "red",
      border: "1px solid #123456 ",
      "--x": "123\n      ",
      "font-size": "2rem"
    });

    dispose();
  }));

test("combines refs", () =>
  createRoot(dispose => {
    let ref1!: HTMLButtonElement;
    let ref2!: HTMLButtonElement;

    const props1 = {
      ref: (el => (ref1 = el)) as HTMLButtonElement | ((el: HTMLButtonElement) => void)
    };

    const props2 = {
      ref: (el => (ref2 = el)) as HTMLButtonElement | ((el: HTMLButtonElement) => void)
    };

    const combinedProps = combineProps(props1, props2);

    const el = document.createElement("button");
    (combinedProps.ref as any)(el);

    assert.is(ref1, el);
    assert.is(ref2, el);

    dispose();
  }));

test.run();

import { createSignal } from "solid-js";
import { fireEvent, render, screen } from "solid-testing-library";

import { createFocusWithin } from "..";

function Example(props: any) {
  const { focusWithinProps } = createFocusWithin(props);

  return (
    <div tabIndex={-1} {...focusWithinProps} data-testid="example">
      {props.children}
    </div>
  );
}

describe("createFocusWithin", function () {
  it("handles focus in-out events on the target itself", async () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        onFocusIn={addEvent}
        onFocusOut={addEvent}
        onFocusWithinChange={(isFocused: boolean) =>
          events.push({ type: "focuschange", isFocused })
        }
      />
    ));

    const el = screen.getByTestId("example");

    fireEvent.focusIn(el);
    await Promise.resolve();

    fireEvent.focusOut(el);
    await Promise.resolve();

    expect(events).toEqual([
      { type: "focusin", target: el },
      { type: "focuschange", isFocused: true },
      { type: "focusout", target: el },
      { type: "focuschange", isFocused: false },
    ]);
  });

  it("does handle focus in-out events on children", async () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        onFocusIn={addEvent}
        onFocusOut={addEvent}
        onFocusWithinChange={(isFocused: boolean) =>
          events.push({ type: "focuschange", isFocused })
        }
      >
        <div data-testid="child" tabIndex={-1} />
      </Example>
    ));

    const el = screen.getByTestId("example");
    const child = screen.getByTestId("child");

    fireEvent.focusIn(child);
    await Promise.resolve();

    fireEvent.focusIn(el);
    await Promise.resolve();

    fireEvent.focusIn(child);
    await Promise.resolve();

    fireEvent.focusOut(child);
    await Promise.resolve();

    expect(events).toEqual([
      { type: "focusin", target: child },
      { type: "focuschange", isFocused: true },
      { type: "focusout", target: child },
      { type: "focuschange", isFocused: false },
    ]);
  });

  it("does not handle focus in-out events if disabled", async () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        isDisabled
        onFocusIn={addEvent}
        onFocusOut={addEvent}
        onFocusWithinChange={(isFocused: boolean) =>
          events.push({ type: "focuschange", isFocused })
        }
      >
        <div data-testid="child" tabIndex={-1} />
      </Example>
    ));

    const child = screen.getByTestId("child");

    fireEvent.focusIn(child);
    await Promise.resolve();

    fireEvent.focusOut(child);
    await Promise.resolve();

    expect(events).toEqual([]);
  });

  it("events do not bubble when stopPropagation is called", async () => {
    const onWrapperFocusIn = jest.fn();
    const onWrapperFocusOut = jest.fn();
    const onInnerFocusIn = jest.fn(e => e.stopPropagation());
    const onInnerFocusOut = jest.fn(e => e.stopPropagation());

    render(() => (
      <div onFocusIn={onWrapperFocusIn} onFocusOut={onWrapperFocusOut}>
        <Example onFocusIn={onInnerFocusIn} onFocusOut={onInnerFocusOut}>
          <div data-testid="child" tabIndex={-1} />
        </Example>
      </div>
    ));

    const child = screen.getByTestId("child");

    fireEvent.focusIn(child);
    await Promise.resolve();

    fireEvent.focusOut(child);
    await Promise.resolve();

    expect(onInnerFocusIn).toHaveBeenCalledTimes(1);
    expect(onInnerFocusOut).toHaveBeenCalledTimes(1);
    expect(onWrapperFocusIn).not.toHaveBeenCalled();
    expect(onWrapperFocusOut).not.toHaveBeenCalled();
  });

  it("events bubble by default", async () => {
    const onWrapperFocusIn = jest.fn();
    const onWrapperFocusOut = jest.fn();
    const onInnerFocusIn = jest.fn();
    const onInnerFocusOut = jest.fn();

    render(() => (
      <div onFocusIn={onWrapperFocusIn} onFocusOut={onWrapperFocusOut}>
        <Example onFocusIn={onInnerFocusIn} onFocusOut={onInnerFocusOut}>
          <div data-testid="child" tabIndex={-1} />
        </Example>
      </div>
    ));

    const child = screen.getByTestId("child");

    fireEvent.focusIn(child);
    await Promise.resolve();

    fireEvent.focusOut(child);
    await Promise.resolve();

    expect(onInnerFocusIn).toHaveBeenCalledTimes(1);
    expect(onInnerFocusOut).toHaveBeenCalledTimes(1);
    expect(onWrapperFocusIn).toHaveBeenCalledTimes(1);
    expect(onWrapperFocusOut).toHaveBeenCalledTimes(1);
  });

  it("should fire onBlur when a focused element is disabled", async () => {
    const onFocusIn = jest.fn();
    const onFocusOut = jest.fn();

    function Example(props: any) {
      const { focusWithinProps } = createFocusWithin(props);
      return (
        <button data-testid="example-button" disabled={props.disabled} {...focusWithinProps}>
          Button
        </button>
      );
    }

    function Wrapper() {
      const [isDisabled, setIsDisabled] = createSignal(false);
      return (
        <div>
          <Example disabled={isDisabled()} onFocusIn={onFocusIn} onFocusOut={onFocusOut} />
          <button data-testid="disable-button" onClick={() => setIsDisabled(true)}>
            Disable
          </button>
        </div>
      );
    }

    render(() => <Wrapper />);

    const exampleButton = screen.getByTestId("example-button");
    const disableButton = screen.getByTestId("disable-button");

    fireEvent.focusIn(exampleButton);
    await Promise.resolve();

    expect(onFocusIn).toHaveBeenCalled();

    fireEvent.click(disableButton);
    await Promise.resolve();

    expect(onFocusOut).toHaveBeenCalled();
  });
});

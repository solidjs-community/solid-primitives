import { createSignal } from "solid-js";
import { fireEvent, render, screen } from "solid-testing-library";

import { createFocus } from "..";

function Example(props: any) {
  const { focusProps } = createFocus(props);

  return (
    <div tabIndex={-1} {...focusProps} data-testid="example">
      {props.children}
    </div>
  );
}

describe("createFocus", () => {
  it("handles focus events on the immediate target", async () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        onFocus={addEvent}
        onBlur={addEvent}
        onFocusChange={(isFocused: boolean) => events.push({ type: "focuschange", isFocused })}
      />
    ));

    const el = screen.getByTestId("example");

    fireEvent.focus(el);
    await Promise.resolve();

    fireEvent.blur(el);
    await Promise.resolve();

    expect(events).toEqual([
      { type: "focus", target: el },
      { type: "focuschange", isFocused: true },
      { type: "blur", target: el },
      { type: "focuschange", isFocused: false },
    ]);
  });

  it("does not handle focus events if disabled", async () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        isDisabled
        onFocus={addEvent}
        onBlur={addEvent}
        onFocusChange={(isFocused: boolean) => events.push({ type: "focuschange", isFocused })}
      />
    ));

    const el = screen.getByTestId("example");

    fireEvent.focus(el);
    await Promise.resolve();

    fireEvent.blur(el);
    await Promise.resolve();

    expect(events).toEqual([]);
  });

  it("should not bubble events when stopPropagation is called", async () => {
    const onWrapperFocus = jest.fn();
    const onWrapperBlur = jest.fn();
    const onInnerFocus = jest.fn(e => e.stopPropagation());
    const onInnerBlur = jest.fn(e => e.stopPropagation());

    render(() => (
      <div onFocus={onWrapperFocus} onBlur={onWrapperBlur}>
        <Example onFocus={onInnerFocus} onBlur={onInnerBlur} />
      </div>
    ));

    const el = screen.getByTestId("example");

    fireEvent.focus(el);
    await Promise.resolve();

    fireEvent.blur(el);
    await Promise.resolve();

    expect(onInnerFocus).toHaveBeenCalledTimes(1);
    expect(onInnerBlur).toHaveBeenCalledTimes(1);
    expect(onWrapperFocus).not.toHaveBeenCalled();
    expect(onWrapperBlur).not.toHaveBeenCalled();
  });

  it("should fire onBlur when a focused element is disabled", async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    function Example(props: any) {
      const { focusProps } = createFocus(props);
      return (
        <button data-testid="example-button" disabled={props.disabled} {...focusProps}>
          Button
        </button>
      );
    }

    function Wrapper() {
      const [isDisabled, setIsDisabled] = createSignal(false);
      return (
        <div>
          <Example disabled={isDisabled()} onFocus={onFocus} onBlur={onBlur} />
          <button data-testid="disable-button" onClick={() => setIsDisabled(true)}>
            Disable
          </button>
        </div>
      );
    }

    render(() => <Wrapper />);

    const exampleButton = screen.getByTestId("example-button");
    const disableButton = screen.getByTestId("disable-button");

    fireEvent.focus(exampleButton);
    await Promise.resolve();

    expect(onFocus).toHaveBeenCalled();

    fireEvent.click(disableButton);
    await Promise.resolve();

    expect(onBlur).toHaveBeenCalled();
  });
});

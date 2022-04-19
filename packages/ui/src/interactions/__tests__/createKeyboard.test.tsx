import { fireEvent, render, screen } from "solid-testing-library";

import { createKeyboard } from "..";

function Example(props: any) {
  const { keyboardProps } = createKeyboard(props);

  return (
    <button {...keyboardProps} data-testid="example">
      {props.children}
    </button>
  );
}

describe("createKeyboard", () => {
  it("handles keyboard events on the immediate target", async () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push({ type: e.type, target: e.target });

    render(() => <Example onKeyDown={addEvent} onKeyUp={addEvent} />);

    const el = screen.getByTestId("example");

    fireEvent.keyDown(el);
    await Promise.resolve();

    fireEvent.keyUp(el);
    await Promise.resolve();

    expect(events).toEqual([
      { type: "keydown", target: el },
      { type: "keyup", target: el },
    ]);
  });

  it("does not handle keyboard events if disabled", async () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push({ type: e.type, target: e.target });

    render(() => <Example isDisabled onKeyDown={addEvent} onKeyUp={addEvent} />);

    const el = screen.getByTestId("example");

    fireEvent.keyDown(el);
    await Promise.resolve();

    fireEvent.keyUp(el);
    await Promise.resolve();

    expect(events).toEqual([]);
  });

  it("should not bubble events when stopPropagation is called", async () => {
    const onWrapperKeyDown = jest.fn();
    const onWrapperKeyUp = jest.fn();
    const onInnerKeyDown = jest.fn(e => e.stopPropagation());
    const onInnerKeyUp = jest.fn(e => e.stopPropagation());

    render(() => (
      <button onKeyDown={onWrapperKeyDown} onKeyUp={onWrapperKeyUp}>
        <Example onKeyDown={onInnerKeyDown} onKeyUp={onInnerKeyUp} />
      </button>
    ));

    const el = screen.getByTestId("example");

    fireEvent.keyDown(el);
    await Promise.resolve();

    fireEvent.keyUp(el);
    await Promise.resolve();

    expect(onInnerKeyDown).toHaveBeenCalledTimes(1);
    expect(onInnerKeyUp).toHaveBeenCalledTimes(1);
    expect(onWrapperKeyDown).not.toHaveBeenCalled();
    expect(onWrapperKeyUp).not.toHaveBeenCalled();
  });
});

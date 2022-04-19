import { fireEvent, render, screen } from "solid-testing-library";

import { createPress } from "..";

function Example(props: any) {
  const { pressProps } = createPress(props);

  return (
    <button {...pressProps} data-testid="example">
      {props.children}
    </button>
  );
}

describe("createPress", () => {
  it("handles press events on the immediate target", async () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        onClick={addEvent}
        onMouseDown={addEvent}
        onMouseUp={addEvent}
        onPressChange={(isPressed: boolean) => events.push({ type: "presschange", isPressed })}
      />
    ));

    const el = screen.getByTestId("example");

    fireEvent.click(el);
    await Promise.resolve();

    fireEvent.mouseDown(el);
    await Promise.resolve();

    fireEvent.mouseUp(el);
    await Promise.resolve();

    expect(events).toEqual([
      { type: "click", target: el },
      { type: "mousedown", target: el },
      { type: "presschange", isPressed: true },
      { type: "mouseup", target: el },
      { type: "presschange", isPressed: false },
    ]);
  });

  it("does not handle press events if disabled", async () => {
    const events: any[] = [];
    const addEvent = (e: any) => events.push({ type: e.type, target: e.target });

    render(() => (
      <Example
        isDisabled
        onClick={addEvent}
        onMouseDown={addEvent}
        onMouseUp={addEvent}
        onPressChange={(isPressed: boolean) => events.push({ type: "presschange", isPressed })}
      />
    ));

    const el = screen.getByTestId("example");

    fireEvent.click(el);
    await Promise.resolve();

    fireEvent.mouseDown(el);
    await Promise.resolve();

    fireEvent.mouseUp(el);
    await Promise.resolve();

    expect(events).toEqual([]);
  });

  it("should not bubble events when stopPropagation is called", async () => {
    const onWrapperClick = jest.fn();
    const onWrapperMouseDown = jest.fn();
    const onWrapperMouseUp = jest.fn();
    const onInnerClick = jest.fn(e => e.stopPropagation());
    const onInnerMouseDown = jest.fn(e => e.stopPropagation());
    const onInnerMouseUp = jest.fn(e => e.stopPropagation());

    render(() => (
      <button
        onClick={onWrapperClick}
        onMouseDown={onWrapperMouseDown}
        onMouseUp={onWrapperMouseUp}
      >
        <Example onClick={onInnerClick} onMouseDown={onInnerMouseDown} onMouseUp={onInnerMouseUp} />
      </button>
    ));

    const el = screen.getByTestId("example");

    fireEvent.click(el);
    await Promise.resolve();

    fireEvent.mouseDown(el);
    await Promise.resolve();

    fireEvent.mouseUp(el);
    await Promise.resolve();

    expect(onInnerClick).toHaveBeenCalledTimes(1);
    expect(onInnerMouseDown).toHaveBeenCalledTimes(1);
    expect(onInnerMouseUp).toHaveBeenCalledTimes(1);
    expect(onWrapperClick).not.toHaveBeenCalled();
    expect(onWrapperMouseDown).not.toHaveBeenCalled();
    expect(onWrapperMouseUp).not.toHaveBeenCalled();
  });
});

import { fireEvent, render, screen } from "solid-testing-library";

import { createToggleState } from "../../toggle";
import { AriaSwitchProps } from "../../types";
import { createSwitch } from "..";

function Switch(props: AriaSwitchProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createSwitch(props, state, () => ref);

  return (
    <label data-testid="label">
      <input data-testid="input" ref={ref} {...inputProps()} />
      {props.children}
    </label>
  );
}

describe("createSwitch", () => {
  const onChangeSpy = jest.fn();

  afterEach(() => {
    onChangeSpy.mockClear();
  });

  it("should set input type to checkbox", async () => {
    render(() => <Switch>Test</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("type", "checkbox");
  });

  it("should set input role to switch", async () => {
    render(() => <Switch>Test</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("role", "switch");
  });

  it("ensure default unchecked can be checked", async () => {
    render(() => <Switch onChange={onChangeSpy}>Click Me</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");
    expect(onChangeSpy).not.toHaveBeenCalled();

    fireEvent.click(input);
    await Promise.resolve();

    expect(input).toHaveAttribute("aria-checked", "true");
    expect(input.checked).toBeTruthy();
    expect(onChangeSpy.mock.calls[0][0]).toBe(true);

    fireEvent.click(input);
    await Promise.resolve();

    expect(input).toHaveAttribute("aria-checked", "false");
    expect(onChangeSpy.mock.calls[1][0]).toBe(false);
  });

  it("can be default checked", async () => {
    render(() => (
      <Switch onChange={onChangeSpy} defaultSelected>
        Click Me
      </Switch>
    ));

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeTruthy();

    fireEvent.click(input);
    await Promise.resolve();

    expect(input.checked).toBeFalsy();
    expect(onChangeSpy.mock.calls[0][0]).toBe(false);
  });

  it("can be controlled checked", async () => {
    render(() => (
      <Switch onChange={onChangeSpy} isSelected>
        Click Me
      </Switch>
    ));

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeTruthy();

    fireEvent.click(input);
    await Promise.resolve();

    expect(input.checked).toBeTruthy();
    expect(onChangeSpy.mock.calls[0][0]).toBe(false);
  });

  it("can be controlled unchecked", async () => {
    render(() => (
      <Switch onChange={onChangeSpy} isSelected={false}>
        Click Me
      </Switch>
    ));

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeFalsy();

    fireEvent.click(input);
    await Promise.resolve();

    expect(input.checked).toBeFalsy();
    expect(onChangeSpy.mock.calls[0][0]).toBe(true);
  });

  it("can be disabled", async () => {
    render(() => (
      <Switch onChange={onChangeSpy} isDisabled>
        Click Me
      </Switch>
    ));

    const label = screen.getByTestId("label");
    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.disabled).toBeTruthy();
    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");

    // I don't know why but `fireEvent` on the input fire the click even if the input is disabled.
    // fireEvent.click(input);
    fireEvent.click(label);
    await Promise.resolve();

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it(" can have a non-visible label", () => {
    const ariaLabel = "not visible";

    render(() => <Switch aria-label={ariaLabel}>Click Me</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-label", ariaLabel);
  });

  it("supports aria-labelledby", () => {
    const ariaLabelledBy = "test";

    render(() => <Switch aria-labelledby={ariaLabelledBy}>Click Me</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-labelledby", ariaLabelledBy);
  });

  it("supports aria-describedby", () => {
    const ariaDescribedBy = "test";

    render(() => <Switch aria-describedby={ariaDescribedBy}>Click Me</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-describedby", ariaDescribedBy);
  });

  it("supports additional props", () => {
    render(() => <Switch data-foo="bar">Click Me</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("data-foo", "bar");
  });

  it("supports excludeFromTabOrder", () => {
    render(() => <Switch excludeFromTabOrder>Click Me</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("tabIndex", "-1");
  });

  it("supports readOnly", async () => {
    render(() => (
      <Switch onChange={onChangeSpy} isSelected isReadOnly>
        Click Me
      </Switch>
    ));

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeTruthy();
    expect(input).toHaveAttribute("aria-checked", "true");
    expect(input).toHaveAttribute("aria-readonly", "true");

    fireEvent.click(input);
    await Promise.resolve();

    expect(input.checked).toBeTruthy();
    expect(input).toHaveAttribute("aria-checked", "true");
    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});

import { fireEvent, render, screen } from "solid-testing-library";

import { createToggleState } from "../../toggle";
import { AriaCheckboxProps } from "../../types";
import { createCheckbox } from "..";

function Checkbox(props: AriaCheckboxProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createCheckbox(props, state, () => ref);

  return (
    <label data-testid="label">
      <input data-testid="input" ref={ref} {...inputProps()} />
      {props.children}
    </label>
  );
}

describe("createCheckbox", () => {
  const onChangeSpy = jest.fn();

  afterEach(() => {
    onChangeSpy.mockClear();
  });

  it("should set input type to checkbox", async () => {
    render(() => <Checkbox>Test</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("type", "checkbox");
  });

  it("ensure default unchecked can be checked", async () => {
    render(() => <Checkbox onChange={onChangeSpy}>Click Me</Checkbox>);

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
      <Checkbox onChange={onChangeSpy} defaultSelected>
        Click Me
      </Checkbox>
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
      <Checkbox onChange={onChangeSpy} isSelected>
        Click Me
      </Checkbox>
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
      <Checkbox onChange={onChangeSpy} isSelected={false}>
        Click Me
      </Checkbox>
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
      <Checkbox onChange={onChangeSpy} isDisabled>
        Click Me
      </Checkbox>
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

  it("can be invalid", () => {
    render(() => <Checkbox validationState="invalid">Click Me</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("passes through aria-errormessage", () => {
    render(() => (
      <Checkbox validationState="invalid" aria-errormessage="test">
        Click Me
      </Checkbox>
    ));

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-errormessage", "test");
  });

  it("can be indeterminate", async () => {
    render(() => (
      <Checkbox onChange={onChangeSpy} isIndeterminate>
        Click Me
      </Checkbox>
    ));

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-checked", "mixed");
    expect(input.indeterminate).toBeTruthy();
    expect(input.checked).toBeFalsy();

    fireEvent.click(input);
    await Promise.resolve();

    expect(input).toHaveAttribute("aria-checked", "mixed");
    expect(input.indeterminate).toBeTruthy();
    expect(input.checked).toBeTruthy();
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy.mock.calls[0][0]).toBe(true);

    fireEvent.click(input);
    await Promise.resolve();

    expect(input).toHaveAttribute("aria-checked", "mixed");
    expect(input.indeterminate).toBeTruthy();
    expect(input.checked).toBeFalsy();
    expect(onChangeSpy.mock.calls[1][0]).toBe(false);
  });

  it("can have a non-visible label", () => {
    const ariaLabel = "not visible";

    render(() => <Checkbox aria-label={ariaLabel}>Click Me</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-label", ariaLabel);
  });

  it("supports aria-labelledby", () => {
    const ariaLabelledBy = "test";

    render(() => <Checkbox aria-labelledby={ariaLabelledBy}>Click Me</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-labelledby", ariaLabelledBy);
  });

  it("supports aria-describedby", () => {
    const ariaDescribedBy = "test";

    render(() => <Checkbox aria-describedby={ariaDescribedBy}>Click Me</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-describedby", ariaDescribedBy);
  });

  it("supports additional props", () => {
    render(() => <Checkbox data-foo="bar">Click Me</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("data-foo", "bar");
  });

  it("supports excludeFromTabOrder", () => {
    render(() => <Checkbox excludeFromTabOrder>Click Me</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("tabIndex", "-1");
  });

  it("supports readOnly", async () => {
    render(() => (
      <Checkbox onChange={onChangeSpy} isSelected isReadOnly>
        Click Me
      </Checkbox>
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

  it("supports uncontrolled readOnly", async () => {
    render(() => (
      <Checkbox onChange={onChangeSpy} isReadOnly>
        Click Me
      </Checkbox>
    ));

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeFalsy();

    fireEvent.click(input);
    await Promise.resolve();

    expect(input.checked).toBeFalsy();
    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});

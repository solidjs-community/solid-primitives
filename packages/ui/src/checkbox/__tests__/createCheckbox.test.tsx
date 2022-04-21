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
  it("should set input type to checkbox", async () => {
    render(() => <Checkbox>Test</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("type", "checkbox");
  });

  it("should update checked and aria-checked state on label click", async () => {
    render(() => <Checkbox>Test</Checkbox>);

    const label = screen.getByTestId("label");
    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");

    fireEvent.click(label);
    await Promise.resolve();

    expect(input.checked).toBeTruthy();
    expect(input).toHaveAttribute("aria-checked", "true");
  });

  it("should not update checked state for disabled checkbox", async () => {
    render(() => <Checkbox isDisabled>Test</Checkbox>);

    const label = screen.getByTestId("label");
    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");

    fireEvent.click(label);
    await Promise.resolve();

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");
  });

  it("should not update checked state for readonly checkbox", async () => {
    render(() => <Checkbox isReadOnly>Test</Checkbox>);

    const label = screen.getByTestId("label");
    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");

    fireEvent.click(label);
    await Promise.resolve();

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");
  });

  it("should makes swicth disabled when isDisabled is true", async () => {
    render(() => <Checkbox isDisabled>Test</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.disabled).toBeTruthy();
  });

  it("should sets aria-readonly='true' when isReadOnly is true", async () => {
    render(() => <Checkbox isReadOnly>Test</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-readonly", "true");
  });

  it("should sets indeterminate and aria-checked='mixed' when isIndeterminate is true", async () => {
    render(() => <Checkbox isIndeterminate>Test</Checkbox>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.indeterminate).toBeTruthy();
    expect(input).toHaveAttribute("aria-checked", "mixed");
  });
});

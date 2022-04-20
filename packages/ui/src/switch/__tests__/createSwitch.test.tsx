import { fireEvent, render, screen } from "solid-testing-library";

import { createToggleState } from "../../toggle";
import { AriaSwitchProps } from "../../types";
import { createSwitch } from "..";

function Switch(props: AriaSwitchProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createSwitch(props, state, ref);

  return (
    <label data-testid="label">
      <input data-testid="input" ref={ref} {...inputProps()} />
      {props.children}
    </label>
  );
}

describe("createSwitch", () => {
  it("should set input role to switch", async () => {
    render(() => <Switch>Test</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("role", "switch");
  });

  it("should update checked state on label click", async () => {
    const state = createToggleState();

    render(() => <Switch>Test</Switch>);

    const label = screen.getByTestId("label");
    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");

    fireEvent.click(label);
    await Promise.resolve();

    expect(input.checked).toBeTruthy();
    expect(input).toHaveAttribute("aria-checked", "true");
  });

  it("should not update checked state for disabled switch", async () => {
    const state = createToggleState();

    render(() => <Switch isDisabled>Test</Switch>);

    const label = screen.getByTestId("label");
    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");

    fireEvent.click(label);
    await Promise.resolve();

    expect(input.checked).toBeFalsy();
    expect(input).toHaveAttribute("aria-checked", "false");
  });

  it("should not update checked state for readonly switch", async () => {
    const state = createToggleState();

    render(() => <Switch isReadOnly>Test</Switch>);

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
    const state = createToggleState();

    render(() => <Switch isDisabled>Test</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input.disabled).toBeTruthy();
  });

  it("should sets aria-readonly when isReadOnly is true", async () => {
    const state = createToggleState();

    render(() => <Switch isReadOnly>Test</Switch>);

    const input = screen.getByTestId("input") as HTMLInputElement;

    expect(input).toHaveAttribute("aria-readonly", "true");
  });
});

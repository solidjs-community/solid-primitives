import { splitProps } from "solid-js";
import { fireEvent, render, screen } from "solid-testing-library";

import { AriaCheckboxGroupItemProps, AriaCheckboxGroupProps } from "../../types";
import {
  CheckboxGroupState,
  createCheckboxGroup,
  createCheckboxGroupItem,
  createCheckboxGroupState
} from "..";

function Checkbox(props: AriaCheckboxGroupItemProps & { checkboxGroupState: CheckboxGroupState }) {
  const [local, others] = splitProps(props, ["children", "checkboxGroupState"]);

  let ref: HTMLInputElement | undefined;
  const { inputProps } = createCheckboxGroupItem(others, local.checkboxGroupState, () => ref);

  return (
    <label>
      <input ref={ref} {...inputProps()} />
      {local.children}
    </label>
  );
}

function CheckboxGroup(props: {
  groupProps: AriaCheckboxGroupProps;
  checkboxProps: AriaCheckboxGroupItemProps[];
}) {
  const state = createCheckboxGroupState(props.groupProps);
  const { groupProps: checkboxGroupProps, labelProps } = createCheckboxGroup(
    props.groupProps,
    state
  );

  return (
    <div {...(checkboxGroupProps() as any)}>
      {props.groupProps.label && <span {...labelProps()}>{props.groupProps.label}</span>}
      <Checkbox checkboxGroupState={state} {...props.checkboxProps[0]} />
      <Checkbox checkboxGroupState={state} {...props.checkboxProps[1]} />
      <Checkbox checkboxGroupState={state} {...props.checkboxProps[2]} />
    </div>
  );
}

describe("createCheckboxGroup", () => {
  it("handles defaults", async () => {
    const onChangeSpy = jest.fn();
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", onChange: onChangeSpy }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" }
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group", { exact: true });
    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    expect(checkboxGroup).toBeInTheDocument();
    expect(checkboxes.length).toBe(3);

    expect(checkboxes[0]).not.toHaveAttribute("name");
    expect(checkboxes[1]).not.toHaveAttribute("name");
    expect(checkboxes[2]).not.toHaveAttribute("name");

    expect(checkboxes[0].value).toBe("dogs");
    expect(checkboxes[1].value).toBe("cats");
    expect(checkboxes[2].value).toBe("dragons");

    expect(checkboxes[0].checked).toBeFalsy();
    expect(checkboxes[1].checked).toBeFalsy();
    expect(checkboxes[2].checked).toBeFalsy();

    const dragons = screen.getByLabelText("Dragons");

    fireEvent.click(dragons);
    await Promise.resolve();

    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith(["dragons"]);

    expect(checkboxes[0].checked).toBeFalsy();
    expect(checkboxes[1].checked).toBeFalsy();
    expect(checkboxes[2].checked).toBeTruthy();
  });

  it("can have a default value", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", value: ["cats"] }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" }
        ]}
      />
    ));

    const cats = screen.getByLabelText("Cats") as HTMLInputElement;

    expect(cats.checked).toBe(true);
  });

  it("name can be controlled", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ name: "test-name", label: "Favorite Pet" }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" }
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    expect(checkboxes[0]).toHaveAttribute("name", "test-name");
    expect(checkboxes[1]).toHaveAttribute("name", "test-name");
    expect(checkboxes[2]).toHaveAttribute("name", "test-name");
  });

  it("supports labeling", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet" }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" }
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group", { exact: true });

    const labelId = checkboxGroup.getAttribute("aria-labelledby");

    expect(labelId).toBeDefined();

    const label = document.getElementById(labelId!);

    expect(label).toHaveTextContent("Favorite Pet");
  });

  it("supports aria-label", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ "aria-label": "My Favorite Pet" }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" }
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group", { exact: true });

    expect(checkboxGroup).toHaveAttribute("aria-label", "My Favorite Pet");
  });

  it("supports custom props", () => {
    const groupProps = { label: "Favorite Pet", "data-testid": "favorite-pet" };
    render(() => (
      <CheckboxGroup
        groupProps={groupProps}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" }
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group", { exact: true });

    expect(checkboxGroup).toHaveAttribute("data-testid", "favorite-pet");
  });

  it("sets aria-disabled and makes checkboxes disabled when isDisabled is true", async () => {
    const groupOnChangeSpy = jest.fn();
    const checkboxOnChangeSpy = jest.fn();

    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", isDisabled: true, onChange: groupOnChangeSpy }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons", onChange: checkboxOnChangeSpy }
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group", { exact: true });

    expect(checkboxGroup).toHaveAttribute("aria-disabled", "true");

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    expect(checkboxes[0]).toHaveAttribute("disabled");
    expect(checkboxes[1]).toHaveAttribute("disabled");
    expect(checkboxes[2]).toHaveAttribute("disabled");

    const dragons = screen.getByLabelText("Dragons");

    fireEvent.click(dragons);
    await Promise.resolve();

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxes[2].checked).toBeFalsy();
  });

  it("doesn't set aria-disabled or make checkboxes disabled by default", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet" }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" }
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group", { exact: true });

    expect(checkboxGroup).not.toHaveAttribute("aria-disabled");

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    expect(checkboxes[0]).not.toHaveAttribute("disabled");
    expect(checkboxes[1]).not.toHaveAttribute("disabled");
    expect(checkboxes[2]).not.toHaveAttribute("disabled");
  });

  it("doesn't set aria-disabled or make checkboxes disabled when isDisabled is false", () => {
    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", isDisabled: false }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons" }
        ]}
      />
    ));

    const checkboxGroup = screen.getByRole("group", { exact: true });

    expect(checkboxGroup).not.toHaveAttribute("aria-disabled");

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    expect(checkboxes[0]).not.toHaveAttribute("disabled");
    expect(checkboxes[1]).not.toHaveAttribute("disabled");
    expect(checkboxes[2]).not.toHaveAttribute("disabled");
  });

  it('sets aria-readonly="true" on each checkbox', async () => {
    const groupOnChangeSpy = jest.fn();
    const checkboxOnChangeSpy = jest.fn();

    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", isReadOnly: true, onChange: groupOnChangeSpy }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons", onChange: checkboxOnChangeSpy }
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];

    expect(checkboxes[0]).toHaveAttribute("aria-readonly", "true");
    expect(checkboxes[1]).toHaveAttribute("aria-readonly", "true");
    expect(checkboxes[2]).toHaveAttribute("aria-readonly", "true");
    expect(checkboxes[2].checked).toBeFalsy();

    const dragons = screen.getByLabelText("Dragons");

    fireEvent.click(dragons);
    await Promise.resolve();

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxes[2].checked).toBeFalsy();
  });

  it("should not update state for readonly checkbox", async () => {
    const groupOnChangeSpy = jest.fn();
    const checkboxOnChangeSpy = jest.fn();

    render(() => (
      <CheckboxGroup
        groupProps={{ label: "Favorite Pet", onChange: groupOnChangeSpy }}
        checkboxProps={[
          { value: "dogs", children: "Dogs" },
          { value: "cats", children: "Cats" },
          { value: "dragons", children: "Dragons", isReadOnly: true, onChange: checkboxOnChangeSpy }
        ]}
      />
    ));

    const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    const dragons = screen.getByLabelText("Dragons");

    fireEvent.click(dragons);
    await Promise.resolve();

    expect(groupOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxOnChangeSpy).toHaveBeenCalledTimes(0);
    expect(checkboxes[2].checked).toBeFalsy();
  });
});

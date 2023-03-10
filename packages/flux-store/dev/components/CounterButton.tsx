import type { ParentComponent, ComponentProps } from "solid-js";
import { splitProps } from "solid-js";
import type { CounterState, CounterActions } from "../stores/counter-store";
import { counterStore } from "../stores/counter-store";

export type CounterButtonProps = Omit<ComponentProps<"button">, "onClick">;

export type CounterButtonType = ParentComponent<
  CounterButtonProps & {
    onClick: (state: CounterState, actions: CounterActions) => void;
    text?: string;
  }
>;

export const CounterButton: CounterButtonType = props => {
  const { state: counterState, actions: counterActions } = counterStore;
  const [counterProps, buttonProps] = splitProps(props, ["onClick", "text"]);
  const onClick = () => counterProps.onClick(counterState, counterActions);

  return (
    <>
      <button {...buttonProps} onClick={onClick}>
        {!!props.text ? props.text : props.children}
      </button>
    </>
  );
};
export default CounterButton;

export const IncreaseButton: ParentComponent<CounterButtonProps> = props => (
  <CounterButton
    {...props}
    onClick={(state, actions) => {
      actions.resetCount(state.value + 1);
    }}
    text="+"
  />
);

export const DecreaseButton: ParentComponent<CounterButtonProps> = props => (
  <CounterButton
    {...props}
    onClick={(state, actions) => {
      actions.resetCount(state.value - 1);
    }}
    text="-"
  />
);

export const ResetButton: ParentComponent<CounterButtonProps> = props => (
  <CounterButton
    {...props}
    onClick={(_, actions) => {
      actions.resetCount();
    }}
    text="Reset"
    style={{
      border: "1px solid red",
      color: "red",
      ...(typeof props.style === "object" ? props.style : {}),
    }}
  />
);

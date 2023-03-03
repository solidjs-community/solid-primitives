import type { ParentComponent, ComponentProps } from "solid-js";
import { IncreaseButton, DecreaseButton, ResetButton } from "./CounterButton";

export const CounterControls: ParentComponent<ComponentProps<"div">> = props => (
  <>
    <div
      {...props}
      style={{
        display: "flex",
        "flex-direction": "row",
        ...(typeof props.style === "object" ? props.style : {}),
      }}
    >
      <IncreaseButton />
      <DecreaseButton style={{ "margin-right": "12px", "margin-left": "3px" }} />
      <ResetButton style={{ "background-color": "black" }} />
    </div>
  </>
);

export default CounterControls;

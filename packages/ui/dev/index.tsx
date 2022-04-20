import "./index.css";
// eslint-disable-next-line import/no-unresolved
import "uno.css";

import { render } from "solid-js/web";

import { AriaCheckboxProps, createCheckbox, createToggleState } from "../src";

type CheckboxProps = AriaCheckboxProps;
function Checkbox(props: CheckboxProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createCheckbox(props, state, () => ref);

  return (
    <label>
      <input {...inputProps()} ref={ref} />
      <span>{props.children}</span>
    </label>
  );
}

function App() {
  return (
    <div>
      <Checkbox>Checkbox</Checkbox>
      <Checkbox isIndeterminate>Checkbox</Checkbox>
    </div>
  );
}

render(() => <App />, document.getElementById("root")!);

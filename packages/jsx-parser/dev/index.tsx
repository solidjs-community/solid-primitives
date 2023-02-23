import { Component, JSX, ParentComponent } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { createJSXParser, createToken, isToken, resolveTokens } from "../src";

type Props = {
  value: number;
  children?: JSX.Element;
};

const parser = createJSXParser<{
  id: "Value" | "Add" | "Subtract";
  props: Props;
}>({ name: "calculator" });

const Calculator: ParentComponent = props => {
  const tokens = resolveTokens(parser, () => props.children, true);

  const calculation = () => {
    let result = 0;
    tokens().forEach(el => {
      if (!isToken(parser, el)) return;
      const data = el.data;
      console.info("token is ", data);
      if (data.id === "Value") {
        result = data.props.value;
      } else if (data.id === "Add") {
        result += data.props.value;
      } else if (data.id === "Subtract") {
        result -= data.props.value;
      }
      console.info("result is", result);
    });
    return result;
  };

  return (
    <div>
      {tokens()} = {calculation()}
    </div>
  );
};

const Value = createToken(
  parser,
  (props: Props) => ({
    props,
    id: "Value"
  }),
  props => <>{props.value}</>
);

const Add = createToken(
  parser,
  (props: Props) => ({
    props,
    id: "Add"
  }),
  props => <> + {props.value}</>
);

const Subtract = createToken(
  parser,
  (props: Props) => ({
    props,
    id: "Subtract"
  }),
  props => <> - {props.value}</>
);

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>This is a calculator</h4>
        <div class="flex">
          <Calculator>
            <div>Invalid element (not token)</div>
            <Value value={1} />
            <Add value={4} />
            <Subtract value={2} />
          </Calculator>
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

import { Component, createMemo, For, JSXElement } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { tokenize, Token, childrenTokens } from "../src";

type Meta = {
  id: "Value" | "Add" | "Subtract";
};
type Props = {
  value: number;
  children?: JSXElement | JSXElement[];
};

type CustomToken = Token<Props, Meta>;

const Calculator = (props: {
  children: JSXElement | JSXElement[] | CustomToken | CustomToken[];
}) => {
  const tokens = childrenTokens(() => props.children);

  const calculation = () => {
    let result = 0;
    tokens().forEach(token => {
      console.log("token is ", token);
      if (token.meta.id === "Value") {
        result = token.props.value;
      } else if (token.meta.id === "Add") {
        result += token.props.value;
      } else if (token.meta.id === "Subtract") {
        result -= token.props.value;
      }
      console.log("result is", result);
    });
    return result;
  };

  return (
    <div>
      <For each={tokens()}>{token => token.callback()}</For> = {calculation()}
    </div>
  );
};

const Value = tokenize(
  (props: Props) => {
    return <>{props.value}</>;
  },
  { id: "Value" }
);

const Add = tokenize(
  (props: Props) => {
    return <> + {props.value}</>;
  },
  { id: "Add" }
);

const Subtract = tokenize(
  (props: Props) => {
    return <> - {props.value}</>;
  },
  { id: "Subtract" }
);

const App: Component = () => {
  return (
    <Calculator>
      <Value value={1} />
      <Add value={4} />
      <Subtract value={2} />
    </Calculator>
  );
};

render(() => <App />, document.getElementById("root")!);

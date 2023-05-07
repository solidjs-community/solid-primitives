import { Component, JSX, ParentComponent } from "solid-js";

import { createTokenizer, createToken, isToken, resolveTokens } from "../src";

type Props = {
  value: number;
  children?: JSX.Element;
};

const parser = createTokenizer<{
  id: "Value" | "Add";
  props: Props;
}>({ name: "calculator" });

const Calculator: ParentComponent = props => {
  const tokens = resolveTokens([parser, Subtract], () => props.children, {
    includeJSXElements: true,
  });

  const calculation = () => {
    let result = 0;
    tokens().forEach(el => {
      if (!isToken([parser, Subtract], el)) {
        console.info("not a token element:", el);
        return;
      }
      console.info("token element:", el);
      const data = el.data;
      console.info("token data is", data);
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
    id: "Value",
  }),
  props => <>{props.value}</>,
);

const Add = createToken(
  parser,
  (props: Props) => ({
    props,
    id: "Add",
  }),
  props => <> + {props.value}</>,
);

const Subtract = createToken(
  (props: Props) => ({
    props: props as Props,
    id: "Subtract" as const,
  }),
  props => <> - {props.value}</>,
);

const App: Component = () => {
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>This is a calculator</h4>
        <div class="flex">
          <Calculator>
            <p>
              <i>(I'am not a token)</i>
            </p>
            <Value value={1} />
            <Add value={4} />
            <Subtract value={2} />
          </Calculator>
        </div>
      </div>
    </div>
  );
};

export default App;

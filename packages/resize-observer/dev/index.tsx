import { Component, createSignal, onMount, Setter } from "solid-js";
import { createStore } from "solid-js/store";
import { render } from "solid-js/web";
import "uno.css";
import { createResizeObserver } from "../src";

const NumberInput: Component<{ value: number; setValue: Setter<number>; name: string }> = props => {
  return (
    <div class="flex flex-col">
      <label for={props.name} class="mb-1">
        {props.name}:
      </label>
      <input
        name={props.name}
        type="range"
        min="10"
        max="400"
        step="10"
        value={props.value}
        onInput={e => props.setValue(+e.currentTarget.value)}
      />
    </div>
  );
};

const App: Component = () => {
  const [width, setWidth] = createSignal(200);
  const [height, setHeight] = createSignal(200);
  const [targets, setTargets] = createStore([document.body]);

  const [captured, setCaptured] = createStore({
    ref: {
      width: 0,
      height: 0
    },
    body: {
      width: 0,
      height: 0
    }
  });

  let ref!: HTMLDivElement;
  createResizeObserver(targets, ({ width, height }, el) => {
    const key = el === ref ? "ref" : "body";
    setCaptured(key, { width, height });
  });
  onMount(() => {
    setTargets(targets.length, ref);
  });

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="center-child min-h-82">
        <div
          ref={ref}
          class="w-24 h-24 bg-orange-500 rounded-md shadow-bg-gray-900 shadow-lg center-child"
          style={{
            width: `${width()}px`,
            height: `${height()}px`
          }}
        >
          {Math.round(captured.ref.width)}px x {Math.round(captured.ref.height)}px
        </div>
      </div>
      <div class="wrapper-h">
        <NumberInput name="width" value={width()} setValue={setWidth} />
        <NumberInput name="height" value={height()} setValue={setHeight} />
      </div>
      <div class="fixed bottom-4 right-4">
        body: {Math.round(captured.body.width)}px x {Math.round(captured.body.height)}px
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

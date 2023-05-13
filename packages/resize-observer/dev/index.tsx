import { Component, createSignal, Setter } from "solid-js";

import { createElementSize, createWindowSize, createResizeObserver } from "../src";

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

  let ref: HTMLDivElement | undefined;
  const ws = createWindowSize();
  const es = createElementSize(() => ref);

  createResizeObserver(
    () => ref,
    ({ width, height }) => console.log("ResizeObserver event", { width, height }),
  );

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="center-child min-h-82">
        <div
          ref={e => (ref = e)}
          class="shadow-bg-gray-900 center-child h-24 w-24 rounded-md bg-orange-500 shadow-lg"
          style={{
            width: `${width()}px`,
            height: `${height()}px`,
          }}
        >
          {Math.round(es.width ?? 0)}px x {Math.round(es.height ?? 0)}px
        </div>
      </div>
      <div class="wrapper-h">
        <NumberInput name="width" value={width()} setValue={setWidth} />
        <NumberInput name="height" value={height()} setValue={setHeight} />
      </div>
      <div class="fixed bottom-4 right-4">
        window: {Math.round(ws.width)}px x {Math.round(ws.height)}px
      </div>
    </div>
  );
};

export default App;

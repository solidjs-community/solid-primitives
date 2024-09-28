import { createSignal, onMount, onCleanup } from "solid-js";
import type { Component } from "solid-js";
import { isServer } from "solid-js/web";
import { VirtualList } from "../src/index.jsx";

const intl = new Intl.NumberFormat();

const items = new Array(100_000).fill(0).map((_, i) => i);

const clampRange = (min: number, max: number, v: number) => (v < min ? min : v > max ? max : v);

const App: Component = () => {
  const [listLength, setListLength] = createSignal(100_000);
  const [overscanCount, setOverscanCount] = createSignal(5);
  const [rootHeight, setRootHeight] = createSignal(240);
  const [rowHeight, setRowHeight] = createSignal(24);

  return (
    <div class="box-border flex min-h-screen w-full flex-col space-y-4 bg-gray-800 p-24 text-white">
      <div class="grid w-full grid-cols-4 bg-white p-4 text-gray-800 shadow-md">
        <div>
          <DemoControl
            label="Number of rows"
            max={100_000}
            min={0}
            name="rowCount"
            setValue={setListLength}
            value={listLength()}
          />
        </div>
        <div>
          <DemoControl
            label="overscanCount"
            max={100}
            min={1}
            name="overscanCount"
            setValue={setOverscanCount}
            value={overscanCount()}
          />
        </div>
        <div>
          <DemoControl
            label="rootHeight"
            max={1_000}
            min={100}
            name="rootHeight"
            setValue={setRootHeight}
            value={rootHeight()}
          />
        </div>
        <div>
          <DemoControl
            label="rowHeight"
            max={100}
            min={10}
            name="rowHeight"
            setValue={setRowHeight}
            value={rowHeight()}
          />
        </div>
      </div>

      <div class="w-full space-y-2 bg-white p-4 text-gray-800 shadow-md">
        View the devtools console for log of items being added and removed from the visible list
      </div>

      <VirtualList
        each={items.slice(0, listLength())}
fallback={<div>no items</div>}
        overscanCount={overscanCount()}
        rootHeight={rootHeight()}
        rowHeight={rowHeight()}
        class="bg-white text-gray-800"
      >
        {item => <VirtualListItem item={item} height={rowHeight()} />}
      </VirtualList>
    </div>
  );
};

type DemoControlProps = {
  label: string;
  max: number;
  min: number;
  name: string;
  setValue: (v: number) => void;
  value: number;
};

const DemoControl: Component<DemoControlProps> = props => (
  <label>
    <div class="text-s">{props.label}:</div>
    <input
      type="number"
      name={props.name}
      value={props.value}
      min={props.min}
      max={props.max}
      class="mx-2 w-32"
      onInput={e => {
        props.setValue(clampRange(props.min, props.max, Number(e.target.value)));
      }}
    />
    <div class="text-xs">
      ({intl.format(props.min)} min, {intl.format(props.max)} max)
    </div>
  </label>
);

type VirtualListItemProps = {
  item: number;
  height: number;
};

const VirtualListItem: Component<VirtualListItemProps> = props => {
  onMount(() => {
    if (!isServer) console.log("item added:", props.item);
  });

  onCleanup(() => {
    if (!isServer) console.log("item removed::", props.item);
  });

  return (
    <div style={{ height: `${props.height}px` }} class="align-center flex">
      {intl.format(props.item)}
    </div>
  );
};

export default App;

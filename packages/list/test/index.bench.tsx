import { describe, bench, afterAll } from "vitest";
import {
  onSettled,
  For,
  createSignal,
  flush,
  type Accessor,
  type Setter,
  Show,
  Switch,
  Match,
} from "solid-js";
import { List } from "../src/index.js";
import { render } from "@solidjs/web";

function PrepareComponent(
  items: number,
  component: (arr: Accessor<number[]>) => any,
): { array: Accessor<number[]>; setArray: Setter<number[]>; unmount: () => void } {
  const [arr, setArr] = createSignal(
    Array.from({ length: items }, (_, i) => i),
    { equals: false },
  );
  const divFor = document.createElement("div");
  document.body.appendChild(divFor);
  return { array: arr, setArray: setArr, unmount: render(() => component(arr), divFor) };
}

function Item(props: { value?: number; index?: number; heavy?: boolean }) {
  return (
    <div>
      <span>{props.index}</span>:<span>{props.value}</span>
      <Show when={props.heavy}>
        <Switch>
          <Match when={(props.value ?? 0) % 20 === 0}>zero</Match>
          <Match when={(props.value ?? 0) % 20 === 1}>one</Match>
          <Match when={(props.value ?? 0) % 20 === 2}>two</Match>
          <Match when={(props.value ?? 0) % 20 === 3}>three</Match>
          <Match when={(props.value ?? 0) % 20 === 4}>four</Match>
          <Match when={(props.value ?? 0) % 20 === 5}>five</Match>
          <Match when={(props.value ?? 0) % 20 === 6}>six</Match>
          <Match when={(props.value ?? 0) % 20 === 7}>seven</Match>
          <Match when={(props.value ?? 0) % 20 === 8}>eight</Match>
          <Match when={(props.value ?? 0) % 20 === 10}>ten</Match>
          <Match when={(props.value ?? 0) % 20 === 11}>eleven</Match>
          <Match when={(props.value ?? 0) % 20 === 12}>twelve</Match>
          <Match when={(props.value ?? 0) % 20 === 13}>thirteen</Match>
          <Match when={(props.value ?? 0) % 20 === 14}>fourteen</Match>
          <Match when={(props.value ?? 0) % 20 === 15}>fifteen</Match>
          <Match when={(props.value ?? 0) % 20 === 16}>sixteen</Match>
          <Match when={(props.value ?? 0) % 20 === 17}>seventeen</Match>
          <Match when={(props.value ?? 0) % 20 === 18}>eighteen</Match>
          <Match when={(props.value ?? 0) % 20 === 19}>nineteen</Match>
        </Switch>
      </Show>
    </div>
  );
}

function SetupActionBench(items: number, setAction: (prev: number[]) => number[], heavy?: boolean) {
  const keyedFor = PrepareComponent(items, arr => (
    <For each={arr()}>{(item, index) => <Item value={item} index={index()} heavy={heavy} />}</For>
  ));

  const unkeyedFor = PrepareComponent(items, arr => (
    <For each={arr()} keyed={false}>
      {(item, index) => <Item value={item()} index={index} heavy={heavy} />}
    </For>
  ));

  const list = PrepareComponent(items, arr => (
    <List each={arr()}>{(item, index) => <Item value={item} index={index()} heavy={heavy} />}</List>
  ));

  const recycleList = PrepareComponent(items, arr => (
    <List each={arr()} recycle>
      {(item, index) => <Item value={item()} index={index()} heavy={heavy} />}
    </List>
  ));

  bench("Keyed For", () => {
    keyedFor.setArray(setAction);
    flush();
  });

  bench("Keyed List", () => {
    list.setArray(setAction);
    flush();
  });

  bench("Unkeyed For", () => {
    unkeyedFor.setArray(setAction);
    flush();
  });

  bench("Recycle Keyed List", () => {
    recycleList.setArray(setAction);
    flush();
  });

  afterAll(() => {
    keyedFor.unmount();
    unkeyedFor.unmount();
    list.unmount();
    recycleList.unmount();
  });
}

describe("create 1000 elements, settle time", () => {
  const ITEMS = 1000;

  const renderedFor = new Set();
  const listFor = Array.from({ length: ITEMS }, (_, i) => i);
  const divFor = document.createElement("div");
  document.body.appendChild(divFor);
  let unmountFor = () => {};

  bench(
    "For",
    () =>
      new Promise(resolve => {
        const ItemFor = (props: { number: number }) => {
          onSettled(() => {
            renderedFor.add(props.number);
            if (renderedFor.size === ITEMS) {
              resolve();
            }
          });
          return <span>{props.number}</span>;
        };
        unmountFor = render(
          () => <For each={listFor}>{item => <ItemFor number={item} />}</For>,
          divFor,
        );
      }),
  );

  const renderedList = new Set();
  const listList = Array.from({ length: ITEMS }, (_, i) => i);
  const divList = document.createElement("div");
  document.body.appendChild(divList);
  let unmountList = () => {};

  bench(
    "List",
    () =>
      new Promise(resolve => {
        const ItemList = (props: { number: number }) => {
          onSettled(() => {
            renderedList.add(props.number);
            if (renderedList.size === ITEMS) {
              resolve();
            }
          });
          return <span>{props.number}</span>;
        };
        unmountList = render(
          () => <List each={listList}>{item => <ItemList number={item} />}</List>,
          divList,
        );
      }),
  );

  afterAll(() => {
    unmountFor();
    unmountList();
  });
});

describe("rotate 1000 elements by 10", () => {
  function rotate(prev: number[]): number[] {
    return prev.map(x => (x + 10) % 1000);
  }

  SetupActionBench(1000, rotate);
});

describe("roll window of 1000 elements by 10", () => {
  function roll(prev: number[]): number[] {
    return prev.map(x => x + 10);
  }

  SetupActionBench(1000, roll);
});

describe("replace 1000 elements", () => {
  function replace(prev: number[]): number[] {
    const max = Math.max(...prev);
    return prev.map((_, i) => i + max + 1);
  }

  SetupActionBench(1000, replace);
});

describe("replace every 2nd element and roll window by 2 of 100 elements", () => {
  function replace(prev: number[]): number[] {
    const max = Math.max(...prev);
    return prev.map((x, i) => (i % 2 === 0 ? i + max + 1 : x + 2));
  }

  SetupActionBench(100, replace);
});

// This is probably cherry picking? But previous benches show calculation time inside control flow.
// In this case heavy element does heavy calculation on value change. Moving element in dom is faster.
// While the action performed on light elements would be faster with just unkeyed flow,
// in this case recycling is faster (because of only index change wherever possible).
describe("replace every 2nd element and roll window by 2 of 100 heavy elements", () => {
  function replace(prev: number[]): number[] {
    const max = Math.max(...prev);
    return prev.map((x, i) => (i % 2 === 0 ? i + max + 1 : x + 2));
  }

  SetupActionBench(100, replace, true);
});

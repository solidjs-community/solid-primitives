import {
  Component,
  type JSX,
  createSignal,
  type Accessor,
  createMemo,
  createEffect,
  onCleanup,
  untrack,
  onMount,
} from "solid-js";
import { listArray } from "../src/index.js";

export function List<T extends readonly any[], U extends JSX.Element>(props: {
  each: T | undefined | null | false;
  fallback?: JSX.Element;
  children: (item: Accessor<T[number]>, index: Accessor<number>) => U;
}) {
  const fallback = "fallback" in props && { fallback: () => props.fallback };
  return ("_SOLID_DEV_"
    ? createMemo(
        listArray(() => props.each, props.children, fallback || undefined),
        undefined,
        { name: "value" },
      )
    : createMemo(
        listArray(() => props.each, props.children, fallback || undefined),
      )) as unknown as JSX.Element;
}

let currentValue = 1;
const App: Component = () => {
  const [signal, setSignal] = createSignal<(string | number)[]>([
    currentValue++,
    currentValue++,
    currentValue++,
  ]);

  return (
    <>
      <List each={signal()}>
        {(v, i) => {
          onMount(() => console.log(`create ${i()}: ${v()}`));
          createEffect(last => {
            if (last) {
              console.log(`set new value for index ${untrack(i)}: ${v()}`);
            }
            return true;
          }, false);
          createEffect((lastIndex: number | null) => {
            if (lastIndex !== null) {
              console.log(`set new index from ${lastIndex} to ${i()}`);
            }
            return i();
          }, null);
          onCleanup(() => console.log(`remove ${i()}: ${v()}`));
          return (
            <pre>
              {i()}:
              <input
                value={v()}
                onInput={e => {
                  setSignal(x => {
                    const n = [...x];
                    n[i()] = e.target.value;
                    return n;
                  });
                }}
              />
              <button
                onClick={() => {
                  setSignal(x => x.filter((y, j) => j != i()));
                }}
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setSignal(x => {
                    const n = [...x];
                    n[i()] = currentValue++;
                    return n;
                  });
                }}
              >
                Replace
              </button>
            </pre>
          );
        }}
      </List>
      <button
        onClick={() => {
          setSignal(x => [...x].sort(() => Math.random() - 0.5));
        }}
      >
        Shuffle
      </button>
      <button
        onClick={() => {
          setSignal(x => {
            const n = [...x];
            n.splice(~~(Math.random() * x.length), 0, currentValue++);
            return n;
          });
        }}
      >
        Insert randomly
      </button>
    </>
  );
};

export default App;
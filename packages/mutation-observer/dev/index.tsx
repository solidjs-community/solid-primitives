import { createMutationObserver } from "../src";
import { Component, createEffect, createSignal, For, Index, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import { createCompositeEffect, debounce } from "@solid-primitives/composites";
import "uno.css";

const toggleItems = (array: readonly boolean[], toggle: number[]): boolean[] => {
  if (!toggle.length) return array as boolean[];
  const copy = array.slice();
  toggle.forEach(i => (copy[i] = !copy[i]));
  return copy;
};

const TestNode: Component = props => {
  return (
    <div class="bg-gray-900 p-6 rounded-lg border-1 border-gray-800 flex flex-col items-center space-y-2">
      {props.children}
    </div>
  );
};

const DisplayRecord: Component<{ record: Record<string, any> }> = props => (
  <div class="text-xs font-mono text-gray-500">
    <For each={Object.keys(props.record)}>
      {k => (
        <p>
          {k}: {String(props.record[k])}
        </p>
      )}
    </For>
  </div>
);

const LogMutationRecord: Component<{
  setupLogFunc: (fn: (e: MutationRecord) => void) => void;
}> = props => {
  const [last, setLast] = createSignal<{
    type?: string;
    removedNodes?: number;
    addedNodes?: number;
    attributeName?: string;
    oldValue?: string;
  }>({
    type: undefined,
    removedNodes: undefined,
    addedNodes: undefined,
    attributeName: undefined,
    oldValue: undefined
  });

  const log = (e: MutationRecord) => {
    setLast({
      type: e.type,
      removedNodes: e.removedNodes.length,
      addedNodes: e.addedNodes.length,
      attributeName: e.attributeName,
      oldValue: e.oldValue
    });
  };

  props.setupLogFunc(log);

  return <DisplayRecord record={last()} />;
};

const SingleParentTest: Component = () => {
  const [show, setShow] = createSignal(true);
  let log!: (e: MutationRecord) => void;
  let ref!: HTMLDivElement;

  onMount(() => {
    createMutationObserver([[ref, { childList: true }]], ([e]) => {
      console.log(e);
      log(e);
    });
  });
  return (
    <>
      <h5>One Parent - One Child</h5>
      <div class="flex flex-wrap justify-center gap-4 max-w-42">
        <div ref={ref} class="w-14 h-10 relative bg-gray-800" onclick={() => setShow(p => !p)}>
          <Show when={show()}>
            <div class="absolute inset-0 bg-teal-600"></div>
          </Show>
        </div>
      </div>
      <LogMutationRecord setupLogFunc={fn => (log = fn)} />
    </>
  );
};

const OneParentManyChildren: Component = () => {
  const [show, setShow] = createSignal([true, true, true, true, true]);
  let parent!: HTMLDivElement;

  const [toggleQueue, setToggleQueue] = createSignal<number[]>([]);
  const toggle = (i: number) => setToggleQueue(p => [...p, i]);
  const [lastRecords, setLastRectods] = createSignal<Object[]>([]);

  createCompositeEffect(
    debounce(
      toggleQueue,
      queue => {
        setShow(toggleItems(show(), queue));
        setToggleQueue([]);
      },
      500
    )
  );

  onMount(() =>
    createMutationObserver([[parent, { childList: true }]], e =>
      setLastRectods(
        e.map(r => ({
          type: r.type,
          removedNodes: r.removedNodes.length,
          addedNodes: r.addedNodes.length
        }))
      )
    )
  );
  return (
    <>
      <h5>One Parent - Many Children</h5>
      <div class="flex space-x-1">
        <For each={show()}>
          {(s, i) => (
            <div
              class="bg-gray-700 w-6 h-6 flex justify-center items-center select-none"
              classList={{ "bg-green-600": show()[i()] }}
              onclick={() => toggle(i())}
            >
              {i()}
            </div>
          )}
        </For>
      </div>
      <p class="text-xs text-gray-500">using {"<For>"}</p>
      <div
        ref={parent}
        class="!mt-4 flex flex-wrap justify-center content-start gap-4 max-w-42 min-h-42"
      >
        <For each={show()}>
          {(show, i) => (
            <Show when={show}>
              <div class="w-14 h-10 bg-teal-600 flex justify-center items-center">{i()}</div>
            </Show>
          )}
        </For>
      </div>
      <For each={lastRecords()}>{record => <DisplayRecord record={record} />}</For>
    </>
  );
};

const OneParentManyChildrenIndex: Component = () => {
  const [show, setShow] = createSignal([true, true, true, true, true]);
  let parent!: HTMLDivElement;

  const [toggleQueue, setToggleQueue] = createSignal<number[]>([]);
  const toggle = (i: number) => setToggleQueue(p => [...p, i]);
  const [lastRecords, setLastRectods] = createSignal<Object[]>([]);

  createCompositeEffect(
    debounce(
      toggleQueue,
      queue => {
        setShow(toggleItems(show(), queue));
        setToggleQueue([]);
      },
      500
    )
  );

  onMount(() =>
    createMutationObserver([[parent, { childList: true }]], e =>
      setLastRectods(
        e.map(r => ({
          type: r.type,
          removedNodes: r.removedNodes.length,
          addedNodes: r.addedNodes.length
        }))
      )
    )
  );
  return (
    <>
      <h5>One Parent - Many Children</h5>
      <div class="flex space-x-1">
        <For each={show()}>
          {(s, i) => (
            <div
              class="bg-gray-700 w-6 h-6 center-child select-none"
              classList={{ "bg-green-600": show()[i()] }}
              onclick={() => toggle(i())}
            >
              {i()}
            </div>
          )}
        </For>
      </div>
      <p class="caption">using {"<Index>"}</p>
      <div
        ref={parent}
        class="!mt-4 flex flex-wrap justify-center content-start gap-4 max-w-42 min-h-42"
      >
        <Index each={show()}>
          {(show, i) => (
            <Show when={show()}>
              <div class="w-14 h-10 bg-teal-600 flex justify-center items-center">{i}</div>
            </Show>
          )}
        </Index>
      </div>
      <For each={lastRecords()}>{record => <DisplayRecord record={record} />}</For>
    </>
  );
};

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen bg-black text-white flex justify-center items-center flex-wrap gap-12">
      <TestNode>
        <SingleParentTest />
      </TestNode>
      <TestNode>
        <OneParentManyChildren />
      </TestNode>
      <TestNode>
        <OneParentManyChildrenIndex />
      </TestNode>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

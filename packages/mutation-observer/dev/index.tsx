import { createMutationObserver } from "../src";
import {
  Component,
  createEffect,
  createSignal,
  For,
  Index,
  JSX,
  onMount,
  Show,
  splitProps
} from "solid-js";
import { render } from "solid-js/web";
import { createCompositeEffect, debounce } from "@solid-primitives/composites";
import "uno.css";

const toggleItems = (array: readonly boolean[], toggle: number[]): boolean[] => {
  if (!toggle.length) return array as boolean[];
  const copy = array.slice();
  toggle.forEach(i => (copy[i] = !copy[i]));
  return copy;
};

const TestingNode: Component<{ output?: JSX.Element; heading?: string }> = props => {
  return (
    <div class="bg-gray-900 rounded-lg border-1 border-gray-800">
      <Show when={props.heading}>
        <div class="border-0 border-b border-gray-800 py-3 px-6 center-child">
          <h5>{props.heading}</h5>
        </div>
      </Show>
      <div class="p-6 flex flex-col items-center space-y-2">{props.children}</div>
      <Show when={props.output}>
        <div class="border-0 border-t border-gray-800 p-3 flex flex-col items-center space-y-1 text-xs font-mono text-gray-500 leading-tight">
          {props.output}
        </div>
      </Show>
    </div>
  );
};

const ToggleBtn: Component<{ state: boolean } & JSX.HTMLAttributes<HTMLButtonElement>> = props => {
  const [, attrs] = splitProps(props, ["children", "state"]);
  return (
    <button
      class="bg-gray-700 text-gray-100 w-6 h-6 center-child select-none cursor-pointer rounded border-1 border-gray-600 hover:bg-gray-600"
      classList={{
        "!bg-green-700 border-green-600 !hover:bg-green-600": props.state
      }}
      {...attrs}
    >
      {props.children}
    </button>
  );
};

const DisplayRecord: Component<{ record: Record<string, any> }> = props => (
  <div>
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

  createMutationObserver(
    () => ref,
    { childList: true },
    e => log(e[0])
  );
  return (
    <TestingNode
      heading="One Parent - One Child"
      output={<LogMutationRecord setupLogFunc={fn => (log = fn)} />}
    >
      <div
        ref={ref}
        class="w-14 h-10 relative bg-gray-800 border-1 border-gray-700 hover:bg-gray-700 rounded cursor-pointer"
        onclick={() => setShow(p => !p)}
      >
        <Show when={show()}>
          <div class="absolute -inset-1px bg-teal-600 border-1 border-teal-500 hover:bg-teal-500 rounded cursor-pointer"></div>
        </Show>
      </div>
    </TestingNode>
  );
};

const ManyParents: Component = () => {
  const [list, setList] = createSignal([true, true, true, true]);
  const toggle = (i: number) => setList(toggleItems(list(), [i]));
  const [parents, setParents] = createSignal<HTMLDivElement[]>([]);
  const [message, setMessage] = createSignal("initial state");

  createMutationObserver(parents, { childList: true }, ([record]) => {
    if (record.removedNodes.length) {
      setMessage(`Removed Node with index: ${record.removedNodes[0].textContent}`);
    } else {
      setMessage(`Added Node with index: ${record.addedNodes[0].textContent}`);
    }
  });

  return (
    <TestingNode heading="Many Parents - One Child" output={message}>
      <p class="caption">Using {"<Index/>"}</p>
      <div class="flex flex-wrap justify-center gap-4 max-w-42">
        <Index each={list()}>
          {(show, i) => (
            <div
              ref={el => setParents(p => [...p, el])}
              class="w-14 h-10 relative bg-gray-800 border-1 border-gray-700 hover:bg-gray-700 rounded cursor-pointer"
              onclick={() => toggle(i)}
            >
              <Show when={show()}>
                <div class="absolute -inset-1px bg-teal-600 border-1 border-teal-500 hover:bg-teal-500 rounded cursor-pointer center-child select-none">
                  {i}
                </div>
              </Show>
            </div>
          )}
        </Index>
      </div>
    </TestingNode>
  );
};

const OneParentManyChildren: Component = () => {
  const [show, setShow] = createSignal([true, true, true, true]);
  let parent!: HTMLDivElement;

  const [toggleQueue, setToggleQueue] = createSignal<number[]>([]);
  const toggle = (i: number) => setToggleQueue(p => [...p, i]);
  const [last, setLast] = createSignal({ added: 0, removed: 0 });

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

  createMutationObserver(
    () => parent,
    { childList: true },
    e =>
      setLast(
        e.reduce(
          (t, c) => ({
            added: t.added + c.addedNodes.length,
            removed: t.removed + c.removedNodes.length
          }),
          { added: 0, removed: 0 }
        )
      )
  );
  return (
    <TestingNode heading="One Parent - Many Children" output={<DisplayRecord record={last()} />}>
      <div class="flex space-x-1">
        <For each={show()}>
          {(s, i) => (
            <ToggleBtn state={show()[i()]} onClick={() => toggle(i())}>
              {i()}
            </ToggleBtn>
          )}
        </For>
      </div>
      <p class="text-xs text-gray-500">using {"<For>"}</p>
      <div ref={parent} class="flex flex-wrap justify-center content-start gap-4 max-w-42 min-h-24">
        <For each={show()}>
          {(show, i) => (
            <Show when={show}>
              <div class="w-14 h-10 bg-teal-600 flex justify-center items-center">{i()}</div>
            </Show>
          )}
        </For>
      </div>
    </TestingNode>
  );
};

const OneParentManyChildrenIndex: Component = () => {
  const [show, setShow] = createSignal([true, true, true, true]);
  let parent!: HTMLDivElement;

  const [toggleQueue, setToggleQueue] = createSignal<number[]>([]);
  const toggle = (i: number) => setToggleQueue(p => [...p, i]);
  const [last, setLast] = createSignal({ added: 0, removed: 0 });

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

  createMutationObserver(
    () => parent,
    { childList: true },
    e =>
      setLast(
        e.reduce(
          (t, c) => ({
            added: t.added + c.addedNodes.length,
            removed: t.removed + c.removedNodes.length
          }),
          { added: 0, removed: 0 }
        )
      )
  );
  return (
    <TestingNode heading="One Parent - Many Children" output={<DisplayRecord record={last()} />}>
      <div class="flex space-x-1">
        <For each={show()}>
          {(s, i) => (
            <ToggleBtn state={show()[i()]} onClick={() => toggle(i())}>
              {i()}
            </ToggleBtn>
          )}
        </For>
      </div>
      <p class="caption">using {"<Index>"}</p>
      <div ref={parent} class="flex flex-wrap justify-center content-start gap-4 max-w-42 min-h-24">
        <Index each={show()}>
          {(show, i) => (
            <Show when={show()}>
              <div class="w-14 h-10 bg-teal-600 flex justify-center items-center">{i}</div>
            </Show>
          )}
        </Index>
      </div>
    </TestingNode>
  );
};

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen bg-black text-white flex justify-center items-center flex-wrap gap-12">
      <SingleParentTest />
      <ManyParents />
      <OneParentManyChildren />
      <OneParentManyChildrenIndex />
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

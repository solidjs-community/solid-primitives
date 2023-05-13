import { createMutationObserver, mutationObserver } from "../src";
import { Component, createSignal, For, Index, onMount, Show } from "solid-js";

import { DisplayRecord, LogMutationRecord, TestingNode, ToggleBtn } from "./components";
import { toggleItems, updateItem } from "./utils";

// avoids tree shaking directive:
mutationObserver;

const SingleParentTest: Component = () => {
  const [show, setShow] = createSignal(true);
  let log!: (e: MutationRecord) => void;

  return (
    <TestingNode
      heading="One Parent - One Child"
      output={<LogMutationRecord setupLogFunc={fn => (log = fn)} />}
    >
      <div
        use:mutationObserver={[{ childList: true }, e => log(e[0])]}
        class="btn-node-parent"
        onclick={() => setShow(p => !p)}
      >
        <Show when={show()}>
          <div class="btn-node"></div>
        </Show>
      </div>
    </TestingNode>
  );
};

const ManyParents: Component = () => {
  const [list, setList] = createSignal([true, true, true, true]);
  const toggle = (i: number) => setList(toggleItems(list(), [i]));
  const [message, setMessage] = createSignal("initial state");

  const [mutationObserver] = createMutationObserver([], ([record]) => {
    if (record.removedNodes.length) {
      setMessage(`Removed Node with index: ${record.removedNodes[0].textContent}`);
    } else {
      setMessage(`Added Node with index: ${record.addedNodes[0].textContent}`);
    }
  });

  return (
    <TestingNode heading="Many Parents - One Child" output={message}>
      <p class="caption">Using {"<Index/>"}</p>
      <div class="max-w-42 flex flex-wrap justify-center gap-4">
        <Index each={list()}>
          {(show, i) => (
            <div
              use:mutationObserver={{ childList: true }}
              class="btn-node-parent"
              onclick={() => toggle(i)}
            >
              <Show when={show()}>
                <div class="btn-node">{i}</div>
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
  const [last, setLast] = createSignal({ added: [] as string[], removed: [] as string[] });

  createCompositeEffect(
    debounce(
      toggleQueue,
      queue => {
        setShow(toggleItems(show(), queue));
        setToggleQueue([]);
      },
      500,
    ),
  );

  createMutationObserver(
    () => parent,
    { childList: true },
    e => {
      const added: string[] = [];
      const removed: string[] = [];
      e.forEach(record => {
        if (record.addedNodes.length) added.push(record.addedNodes[0].textContent);
        else removed.push(record.removedNodes[0].textContent);
      });
      setLast({ added, removed });
    },
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
      <div ref={parent} class="max-w-42 min-h-24 flex flex-wrap content-start justify-center gap-4">
        <For each={show()}>
          {(show, i) => (
            <Show when={show}>
              <div class="flex h-10 w-14 items-center justify-center bg-teal-600">{i()}</div>
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
  const [last, setLast] = createSignal({ added: [] as string[], removed: [] as string[] });

  createCompositeEffect(
    debounce(
      toggleQueue,
      queue => {
        setShow(toggleItems(show(), queue));
        setToggleQueue([]);
      },
      500,
    ),
  );

  createMutationObserver(
    () => parent,
    { childList: true },
    e => {
      const added: string[] = [];
      const removed: string[] = [];
      e.forEach(record => {
        if (record.addedNodes.length) added.push(record.addedNodes[0].textContent);
        if (record.removedNodes.length) removed.push(record.removedNodes[0].textContent);
      });
      setLast({ added, removed });
    },
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
      <div ref={parent} class="max-w-42 min-h-24 flex flex-wrap content-start justify-center gap-4">
        <Index each={show()}>
          {(show, i) => (
            <Show when={show()}>
              <div class="flex h-10 w-14 items-center justify-center bg-teal-600">{i}</div>
            </Show>
          )}
        </Index>
      </div>
    </TestingNode>
  );
};

const AttributesTest: Component = () => {
  const [list, setList] = createSignal([0, 0, 0]);
  let parent!: HTMLDivElement;
  let log!: (e: MutationRecord) => void;

  const handleClick = (i: number) =>
    setList(updateItem(list(), i, state => (state + 1 > 3 ? 0 : state + 1)));

  createMutationObserver(
    () => parent,
    { attributes: true, subtree: true },
    e => log(e[0]),
  );

  return (
    <TestingNode
      heading="Attributes"
      output={<LogMutationRecord setupLogFunc={fn => (log = fn)} />}
    >
      <div ref={parent} class="flex justify-center gap-4">
        <div
          class="group h-16 w-16 cursor-pointer"
          style={{ transform: `rotate(${list()[0] * 90}deg)` }}
          onclick={() => handleClick(0)}
        >
          <div class="ml-3 h-full w-10 rounded bg-gradient-to-b from-teal-700 to-cyan-700 opacity-90 group-hover:opacity-100"></div>
        </div>
        <div
          class="group h-16 w-16 transform cursor-pointer"
          classList={{
            "translate-y-3": list()[1] === 1,
            "translate-x-3": list()[1] === 2,
            "-translate-x-3": list()[1] === 3,
          }}
          onclick={() => handleClick(1)}
        >
          <div class="ml-3 h-full w-10 rounded bg-gradient-to-b from-teal-700 to-cyan-700 opacity-90 group-hover:opacity-100"></div>
        </div>
        <button
          class="not-disabled:opacity-60 group m-0 h-16 w-16 transform cursor-pointer border-0 bg-transparent p-0"
          disabled={list()[2] % 2 === 1}
        >
          <div
            class="ml-3 h-full w-10 rounded bg-gradient-to-b from-teal-700 to-cyan-700"
            classList={{ "opacity-50": list()[2] % 2 === 1 }}
            onclick={() => handleClick(2)}
          ></div>
        </button>
      </div>
    </TestingNode>
  );
};

const App: Component = () => {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return (
    <div class="box-border flex min-h-screen w-full flex-wrap items-center justify-center gap-12 bg-black p-24 text-white">
      {mounted() && (
        <>
          <AttributesTest />
          <SingleParentTest />
          <ManyParents />
          <OneParentManyChildren />
          <OneParentManyChildrenIndex />
        </>
      )}
    </div>
  );
};

export default App;

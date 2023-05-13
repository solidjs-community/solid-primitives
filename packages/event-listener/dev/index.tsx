import { WindowEventListener, eventListener, createEventListener, createEventSignal } from "../src";
import { Component, createSignal, For, Show } from "solid-js";

import { DisplayRecord } from "./components";

eventListener;

const App: Component = () => {
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-16 overflow-hidden bg-indigo-800 p-24 text-white">
      <WindowMousemove />
      <List />
      <CustomEvents />
      <DirectiveUsage />
      <EventMap />
    </div>
  );
};

const WindowMousemove: Component = () => {
  const [listen, setListen] = createSignal(true);
  const [mouse, setMouse] = createSignal({ x: 0, y: 0 });

  return (
    <div class="fixed left-4 top-4">
      <Show when={listen()}>
        <WindowEventListener onmousemove={({ x, y }) => setMouse({ x, y })} />
      </Show>
      <h4>WindowEventListener</h4>
      <DisplayRecord record={mouse()}></DisplayRecord>
      <button class="cursor-pointer" onclick={() => setListen(p => !p)}>
        Toggle mousemove event
      </button>
    </div>
  );
};

const List: Component = () => {
  const [lastEvent, setLastEvent] = createSignal<Event>();
  const [n, setN] = createSignal(5);
  const [items, setItems] = createSignal<HTMLDivElement[]>([]);

  // new event listeners are automatically added to the new items
  createEventListener(items, "click", setLastEvent);

  return (
    <div class="flex flex-col items-center space-y-6">
      <h4>Multiple Reactive Targets</h4>
      <p>Clicked: {(lastEvent()?.target as any)?.textContent}</p>
      <div class="flex flex-wrap justify-center gap-4">
        <For each={Array.from({ length: n() }, (_, i) => i)}>
          {i => (
            <div
              ref={el => setItems(p => [...p, el])}
              class="cursor-pointer select-none bg-yellow-500 p-6 text-gray-900"
            >
              {i}
            </div>
          )}
        </For>
      </div>
      <button onclick={() => setN(p => p + 1)}>Add one more</button>
    </div>
  );
};

// don't use interfaces for EventMap type:
type MyCustomEvents = {
  a: Event;
  b: Event;
  c: Event;
};

const CustomEvents: Component = () => {
  let ref!: HTMLDivElement;
  const lastEvent = createEventSignal<MyCustomEvents>(() => ref, ["a", "b", "c"]);

  return (
    <div class="flex flex-col items-center space-y-4">
      <h4>Custom Events</h4>
      <p>Event: {lastEvent()?.type}</p>
      <div ref={ref} class="bg-blue-700 p-4">
        TARGET
      </div>
      <div class="flex space-x-2">
        <button onclick={() => ref.dispatchEvent(new Event("a"))}>Emit A</button>
        <button onclick={() => ref.dispatchEvent(new Event("b"))}>Emit B</button>
        <button onclick={() => ref.dispatchEvent(new Event("c"))}>Emit C</button>
      </div>
    </div>
  );
};

const DirectiveUsage: Component = () => {
  const [count, setCount] = createSignal(0);
  return (
    <div class="flex flex-col items-center space-y-2">
      <h4>Directive Usage</h4>
      <button class="p-4" use:eventListener={["click", () => setCount(p => p + 1)]}>
        Count: {count()}
      </button>
    </div>
  );
};

const EventMap: Component = () => {
  let ref!: HTMLDivElement;
  const lastEvent = createEventSignal(() => ref, ["mouseenter", "mouseleave", "click", "wheel"], {
    passive: true,
  });

  return (
    <div class="flex flex-col items-center space-y-2">
      <h4>Event Map</h4>
      <p>Last event: {lastEvent()?.type}</p>
      <div
        ref={ref}
        class="w-46 center-child h-32 select-none rounded-lg bg-green-500 bg-opacity-70"
      >
        <p>TARGET</p>
      </div>
    </div>
  );
};

export default App;

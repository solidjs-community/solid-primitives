import {
  createEventListenerMap,
  WindowEventListener,
  eventListener,
  createEventSignal
} from "../src";
import { Component, createSignal, For, Show } from "solid-js";
import { render } from "solid-js/web";
import { DisplayRecord } from "./components";
import "uno.css";
eventListener;

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen overflow-hidden bg-indigo-800 text-white flex flex-col justify-center items-center space-y-16">
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
    <div class="fixed top-4 left-4">
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
  const [n, setN] = createSignal(5);
  const [items, setItems] = createSignal<HTMLDivElement[]>([]);

  // new event listeners are automatically added to the new items
  const [lastEvent] = createEventSignal(items, "click");

  return (
    <div class="flex flex-col items-center space-y-6">
      <h4>Multiple Reactive Targets</h4>
      <p>Clicked: {(lastEvent()?.target as any)?.textContent}</p>
      <div class="flex flex-wrap justify-center gap-4">
        <For each={Array.from({ length: n() }, (_, i) => i)}>
          {i => (
            <div
              ref={el => setItems(p => [...p, el])}
              class="p-6 bg-yellow-500 text-gray-900 select-none cursor-pointer"
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
  const [lastEvent, setLastEvent] = createSignal<Event>();
  createEventListenerMap(() => ref, {
    A: setLastEvent,
    B: setLastEvent,
    C: setLastEvent
  });

  return (
    <div class="flex flex-col items-center space-y-4">
      <h4>Custom Events</h4>
      <p>Event: {lastEvent()?.type}</p>
      <div ref={ref} class="bg-blue-700 p-4">
        TARGET
      </div>
      <div class="flex space-x-2">
        <button onclick={() => ref.dispatchEvent(new Event("A"))}>Emit A</button>
        <button onclick={() => ref.dispatchEvent(new Event("B"))}>Emit B</button>
        <button onclick={() => ref.dispatchEvent(new Event("C"))}>Emit C</button>
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
  const [lastEvent, setLastEvent] = createSignal<Event>();

  let ref!: HTMLDivElement;
  createEventListenerMap(
    () => ref,
    {
      mouseenter: setLastEvent,
      mouseleave: setLastEvent,
      click: setLastEvent,
      wheel: setLastEvent
    },
    { passive: true }
  );

  return (
    <div class="flex flex-col items-center space-y-2">
      <h4>Event Map</h4>
      <p>Last event: {lastEvent()?.type}</p>
      <div
        ref={ref}
        class="w-46 h-32 bg-green-500 bg-opacity-70 rounded-lg select-none center-child"
      >
        <p>TARGET</p>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

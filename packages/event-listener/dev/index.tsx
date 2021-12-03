import { createEventListener, GlobalEventListener } from "../src";
import { Component, createSignal, For, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import { DisplayRecord } from "./components";
import "uno.css";

const App: Component = () => {
  const [handleMouse, setHandleMouse] = createSignal((e: MouseEvent) => {
    console.log(e.pageX, e.pageY);
  });
  const [show, setShow] = createSignal(true);

  return (
    <div class="p-24 box-border w-full min-h-screen overflow-hidden bg-indigo-800 text-white flex flex-col justify-center items-center space-y-16">
      <WindowMousemove />
      <List />
      <CustomEvents />
      <DirectiveUsage />
      <Show when={show()}>
        <GlobalEventListener
          onmousemove={handleMouse()}
          onwheel={() => setHandleMouse(() => e => console.log(e))}
        />
      </Show>
      <GlobalEventListener onclick={e => setShow(p => !p)} />
    </div>
  );
};

const List: Component = () => {
  const [n, setN] = createSignal(5);
  const [items, setItems] = createSignal<HTMLDivElement[]>([]);
  const [lastClicked, setLastClicked] = createSignal<string>(null);

  // new event listeners are automatically added to the new items
  createEventListener(items, "click", e => {
    setLastClicked((e.target as HTMLElement).textContent);
  });

  return (
    <div class="flex flex-col items-center space-y-6">
      <h4>Multiple Reactive Targets</h4>
      <p>Clicked: {lastClicked()}</p>
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

const WindowMousemove: Component = () => {
  const [mouse, setMouse] = createSignal({ x: 0, y: 0 });
  let active = true;
  const [stop, start] = createEventListener(window, "mousemove", e => {
    setMouse({
      x: e.pageX,
      y: e.pageY
    });
  });

  return (
    <div class="fixed top-4 left-4">
      <h4>Window target, stop() & start()</h4>
      <DisplayRecord record={mouse()}></DisplayRecord>
      <button
        class="cursor-pointer"
        onclick={() => {
          if (active) stop();
          else start();
          active = !active;
        }}
      >
        Toggle mousemove event
      </button>
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
  const [lastEvent, setLastEvent] = createSignal<string>(null);

  const handleCustomEvent = (e: Event) => {
    setLastEvent(e.type);
  };

  let ref!: HTMLDivElement;
  // if you wrap createEventListener inside onMount,
  // then you dont have to pass your ref as a function
  onMount(() => {
    createEventListener<MyCustomEvents>(ref, "a", handleCustomEvent);
    createEventListener<MyCustomEvents>(ref, "b", handleCustomEvent);
    createEventListener<MyCustomEvents>(ref, "c", handleCustomEvent);
  });

  return (
    <div class="flex flex-col items-center space-y-4">
      <h4>Custom Events</h4>
      <p>Event: {lastEvent()}</p>
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
      <button class="p-4" use:createEventListener={["click", () => setCount(p => p + 1)]}>
        Count: {count()}
      </button>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

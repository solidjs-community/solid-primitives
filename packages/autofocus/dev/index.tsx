import { Component, createSignal, Switch, Match } from "solid-js";
import { autofocus, createAutofocus } from "../src";

autofocus;

const AutofocusDirective: Component = () => {
  return (
    <button autofocus use:autofocus>
      directive
    </button>
  );
};

const AutofocusRef: Component = () => {
  let ref!: HTMLButtonElement;

  createAutofocus(() => ref);

  return (
    <button class="btn" ref={ref}>
      ref
    </button>
  );
};

const AutofocusRefSignal: Component = () => {
  const [ref, setRef] = createSignal<HTMLButtonElement>();

  createAutofocus(ref);

  return (
    <button class="btn" ref={setRef}>
      ref signal
    </button>
  );
};

const App: Component = () => {
  const [toggle, setToggle] = createSignal(0);

  return (
    <div class="center-child h-screen w-screen">
      <div class="m-4 flex gap-4">
        <button class="btn" onClick={() => setToggle((toggle() + 1) % 6)}>
          toggle
        </button>

        <Switch fallback={<button>no autofocus</button>}>
          <Match when={toggle() === 0}>
            <AutofocusDirective />
          </Match>
          <Match when={toggle() === 2}>
            <AutofocusRef />
          </Match>
          <Match when={toggle() === 4}>
            <AutofocusRefSignal />
          </Match>
        </Switch>
      </div>
    </div>
  );
};

export default App;

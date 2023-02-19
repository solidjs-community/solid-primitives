import { JSX, Component, createSignal, Switch, Match } from "solid-js";
import { render } from "solid-js/web";
import { autofocus, createAutofocus } from "../src";
import "uno.css";

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

  return <button ref={ref}>ref</button>;
};

const AutofocusRefSignal: Component = () => {
  const [ref, setRef] = createSignal<HTMLButtonElement>();

  createAutofocus(ref);

  return <button ref={setRef}>ref signal</button>;
};

const App: Component = () => {
  const [toggle, setToggle] = createSignal(0);

  return (
    <div class="flex gap-4 m-4">
      <button onClick={() => setToggle((toggle() + 1) % 6)}>toggle</button>

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
  );
};

render(() => <App />, document.getElementById("root")!);

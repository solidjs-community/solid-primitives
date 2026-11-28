import { type Component, createSignal } from "solid-js";
import { Show } from "@solidjs/web";
import { createDismissableLayer, useLayerStack } from "../src/index.js";

const Panel: Component<{ title: string; onClose: () => void; children?: any }> = props => {
  const [el, setEl] = createSignal<HTMLElement>();
  const [shake, setShake] = createSignal(false);
  const { isTop } = createDismissableLayer({
    ref: el,
    onDismiss: () => props.onClose(),
  });
  return (
    <div
      ref={setEl}
      class="wrapper-v rounded border p-4"
      style={{ opacity: isTop() ? 1 : 0.6, outline: shake() ? "2px solid red" : "none" }}
      onAnimationEnd={() => setShake(false)}
    >
      <h4>{props.title}</h4>
      {props.children}
    </div>
  );
};

const App: Component = () => {
  const [outer, setOuter] = createSignal(false);
  const [inner, setInner] = createSignal(false);
  const stack = useLayerStack();

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <p class="caption">Layers: {stack().length} — Escape / outside press closes the top one.</p>
      <button class="btn" onClick={() => setOuter(true)}>
        Open outer
      </button>
      <Show when={outer()}>
        <Panel title="Outer" onClose={() => setOuter(false)}>
          <button class="btn" onClick={() => setInner(true)}>
            Open inner
          </button>
          <Show when={inner()}>
            <Panel title="Inner" onClose={() => setInner(false)} />
          </Show>
        </Panel>
      </Show>
    </div>
  );
};

export default App;

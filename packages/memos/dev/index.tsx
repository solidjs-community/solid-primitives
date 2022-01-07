import { createLazyMemo } from "../src";
import { Component, createRoot, createSignal, Show } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { createEffect } from "solid-js";
import { onCleanup } from "solid-js";

const [count, memo, setCount] = createRoot(() => {
  const [count, setCount] = createSignal(0);
  const memo = createLazyMemo(() => {
    console.log("run calc");
    return count();
  });
  return [count, memo, setCount];
});

const TestComponent: Component = props => {
  return <div class="p-4 bg-orange-200 select-none">in component: {memo()}</div>;
};

const TestEffect: Component = props => {
  createEffect(() => {
    console.log("effect", memo());
  });
  return <></>;
};

const App: Component = () => {
  const [showComp, setShowComp] = createSignal(false);
  const [showEffect, setShowEffect] = createSignal(false);

  return (
    <div class="p-24 box-border w-full min-h-screen">
      <button onclick={() => setShowComp(p => !p)}>component: {showComp() ? "ON" : "OFF"}</button>
      <button onclick={() => setShowEffect(p => !p)}>effect: {showEffect() ? "ON" : "OFF"}</button>
      <button onclick={() => setCount(p => p + 1)}>increase</button>
      <br />
      count: {count()};<br />
      <Show when={showComp()}>
        <TestComponent />
      </Show>
      <Show when={showEffect()}>
        <TestEffect />
      </Show>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

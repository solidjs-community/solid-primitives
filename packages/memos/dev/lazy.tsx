import { createLazyMemo } from "../src";
import { Component, createRoot, createSignal, Show, createEffect } from "solid-js";

const [count, setCount] = createSignal(0);
const [runs, setRuns] = createSignal(0);
const [effectCount, setEffectCount] = createSignal(0);
const memo = createRoot(() =>
  createLazyMemo(() => {
    setRuns(p => p + 1);
    return count();
  })
);

const TestComponent: Component = () => {
  return <div class="p-4 bg-orange-200 text-gray-800 select-none">in component: {memo()}</div>;
};

const TestEffect: Component = () => {
  createEffect(() => {
    setEffectCount(memo());
  });
  return <></>;
};

const Lazy: Component = () => {
  const [showComp, setShowComp] = createSignal(false);
  const [showEffect, setShowEffect] = createSignal(false);

  return (
    <>
      <button class="btn" onclick={() => setShowComp(p => !p)}>
        component: {showComp() ? "ON" : "OFF"}
      </button>
      <button class="btn" onclick={() => setShowEffect(p => !p)}>
        effect: {showEffect() ? "ON" : "OFF"}
      </button>
      <button class="btn" onclick={() => setCount(p => p + 1)}>
        increase
      </button>
      <p>count: {count()};</p>
      <p>calc ran times: {runs()}</p>
      <Show when={showComp()}>
        <TestComponent />
      </Show>
      <Show when={showEffect()}>
        <p>count in effect: {effectCount()}</p>
      </Show>
      <Show when={showEffect()}>
        <TestEffect />
      </Show>
    </>
  );
};

export default Lazy;

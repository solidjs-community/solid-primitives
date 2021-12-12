import {
  createEventBus,
  EventBusSubscribe,
  createMultiEventBus,
  MultiEventBusSubscribe
} from "../src";
import { Component, createSignal, onMount } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

type AnimEvents = {
  spin: number;
  wiggle: void;
};

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center bg-gray-800 text-white">
      <ParentNode />
    </div>
  );
};

const ParentNode: Component = () => {
  const { listen, emit } = createMultiEventBus<AnimEvents>();

  return (
    <div class="p-8 flex flex-col items-center space-y-4 bg-gray-700 rounded-2xl">
      <h3>Send events from Parent to Children</h3>
      <div class="flex space-x-4">
        <button class="btn" onclick={() => emit("spin", Math.random() * 360 - 180)}>
          SPIN!
        </button>
        <button class="btn" onclick={() => emit("wiggle")}>
          WIGGLE!
        </button>
      </div>
      <div class="flex justify-center flex-wrap gap-8 !mt-12">
        <ChildNode subscribe={listen} />
        <ChildNode subscribe={listen} />
        <ChildNode subscribe={listen} />
      </div>
    </div>
  );
};

const ChildNode: Component<{
  subscribe: MultiEventBusSubscribe<AnimEvents>;
}> = props => {
  const [angle, setAngle] = createSignal(0);
  props.subscribe("spin", angle => setAngle(p => p + angle));

  let ref!: HTMLDivElement;
  let anim: Animation;
  onMount(() => {
    const keyframes = new KeyframeEffect(
      ref,
      {
        transform: [
          "translate3d(-1px, 0, 0)",
          "translate3d(2px, 0, 0)",
          "translate3d(-4px, 0, 0)",
          "translate3d(4px, 0, 0)",
          "translate3d(-4px, 0, 0)",
          "translate3d(4px, 0, 0)",
          "translate3d(-4px, 0, 0)",
          "translate3d(2px, 0, 0)",
          "translate3d(-1px, 0, 0)"
        ]
      },
      { duration: 500 }
    );
    anim = new Animation(keyframes);
  });

  props.subscribe("wiggle", () => {
    anim.currentTime = 0;
    anim.play();
  });
  return (
    <div ref={ref}>
      <div
        class="w-32 h-24 center-child bg-orange-700 bg-opacity-80 rounded-lg transition-transform duration-300"
        style={{
          transform: `rotate(${angle()}deg)`
        }}
      >
        Child
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

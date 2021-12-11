import { createEventBus, EventBusSubscribe } from "../src";
import type { Component } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const ChildNode: Component<{
  listenSpin: EventBusSubscribe<number>;
  listenWiggle: EventBusSubscribe;
}> = props => {
  props.listenSpin(angle => {
    console.log("spin", angle);
  });
  props.listenWiggle(() => {
    console.log("wiggle");
  });
  return <div class="w-32 h-24 center-child bg-orange-700 bg-opacity-80 rounded-lg">Child</div>;
};

const ParentNode: Component = () => {
  const { add: listenToSpin, emit: spin } = createEventBus<number>();
  const wiggleBus = createEventBus();
  return (
    <div class="p-8 flex flex-col items-center space-y-4 bg-gray-700 rounded-2xl">
      <h3>Send events from Parent to Children</h3>
      <div class="flex space-x-4">
        <button class="btn" onclick={() => spin(Math.random() * 360 - 180)}>
          SPIN!
        </button>
        <button class="btn" onclick={() => wiggleBus.emit()}>
          WIGGLE!
        </button>
      </div>
      <div class="flex justify-center flex-wrap gap-8 !mt-12">
        <ChildNode listenSpin={listenToSpin} listenWiggle={wiggleBus.add} />
        <ChildNode listenSpin={listenToSpin} listenWiggle={wiggleBus.add} />
        <ChildNode listenSpin={listenToSpin} listenWiggle={wiggleBus.add} />
      </div>
    </div>
  );
};

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center bg-gray-800 text-white">
      <ParentNode />
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

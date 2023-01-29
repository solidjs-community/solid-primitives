import {
  createEventHub,
  Listen,
  createSimpleEmitter,
  createEventStack,
  EventStack,
  Emit
} from "../src";
import { Component, createSignal, For, onMount } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-12 bg-gray-800 text-white">
      <PubsubTest />
      <HubParentNode />
      <NotificationsTest />
    </div>
  );
};

const PubsubTest: Component = () => {
  const Switch: Component<{
    emit: Emit<boolean>;
  }> = props => {
    const [on, setOn] = createSignal(true);
    const toggle = () =>
      setOn(p => {
        props.emit(!p);
        return !p;
      });
    return (
      <button class="w-12 h-8 bg-white border-none rounded font-semibold" onclick={toggle}>
        {on() ? "ON" : "OFF"}
      </button>
    );
  };

  const Light: Component<{
    subscribe: Listen<boolean>;
  }> = props => {
    const [on, setOn] = createSignal(true);
    props.subscribe(setOn);
    return (
      <div
        class="w-18 h-18 bg-gray-500 rounded-full"
        classList={{
          "bg-yellow-200": on()
        }}
        style={{
          "box-shadow": on() ? "0 0 24px rgb(254, 239, 179)" : ""
        }}
      ></div>
    );
  };

  const [sub, emit] = createSimpleEmitter<boolean>();
  return (
    <div class="wrapper-h">
      <Switch emit={emit} />
      <Light subscribe={sub} />
    </div>
  );
};

const HubParentNode: Component = () => {
  const { emit, spin, wiggle } = createEventHub(_ => ({
    spin: _<number>(),
    wiggle: _<void>()
  }));

  return (
    <div class="wrapper-v">
      <div class="flex space-x-4">
        <button class="btn" onclick={() => emit("spin", Math.random() * 360 - 180)}>
          SPIN!
        </button>
        <button class="btn" onclick={() => emit("wiggle")}>
          WIGGLE!
        </button>
      </div>
      <div class="flex justify-center flex-wrap gap-8 !mt-12">
        <HubChildNode listenToSpin={spin.listen} listenToWiggle={wiggle.listen} />
        <HubChildNode listenToSpin={spin.listen} listenToWiggle={wiggle.listen} />
        <HubChildNode listenToSpin={spin.listen} listenToWiggle={wiggle.listen} />
      </div>
    </div>
  );
};

const HubChildNode: Component<{
  listenToSpin: Listen<number>;
  listenToWiggle: Listen;
}> = props => {
  const [angle, setAngle] = createSignal(0);
  props.listenToSpin(angle => setAngle(p => p + angle));

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

  props.listenToWiggle(() => {
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

const NotificationsTest: Component = () => {
  const [inputText, setInputText] = createSignal("my message!");

  let bus!: EventStack<string, { text: string }>;

  return (
    <div class="wrapper-h">
      <form
        class="flex space-x-2"
        onsubmit={e => {
          e.preventDefault();
          bus.emit(inputText());
          setInputText("");
        }}
      >
        <input
          type="text"
          value={inputText()}
          oninput={e => setInputText(e.currentTarget.value)}
        ></input>
        <button class="btn">SEND</button>
        <button class="btn" type="button" onclick={() => bus.setStack([])}>
          CLEAR
        </button>
      </form>
      <Toaster useEventBus={x => (bus = x)} />
    </div>
  );
};

const Toaster: Component<{
  useEventBus: (bus: EventStack<string, { text: string }>) => void;
}> = props => {
  const bus = createEventStack({
    toValue(e: string) {
      const text = e.length > 50 ? e.substring(0, 50) + "..." : e;
      return { text };
    },
    length: 10
  });
  props.useEventBus(bus);

  return (
    <div class="fixed top-4 right-4 flex flex-col items-end space-y-4">
      <For each={bus.stack()}>
        {item => (
          <div class="p-2 px-3 bg-gray-600 animate-fade-in-down animate-count-1 animate-duration-150">
            <span class="mr-2">{item.text}</span>
            <button onClick={() => bus.removeFromStack(item)}>X</button>
          </div>
        )}
      </For>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

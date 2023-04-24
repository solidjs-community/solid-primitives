import { Component, For, Show, createSignal } from "solid-js";
import { render } from "solid-js/web";
import createPresenceSignal from "../src/createPresence";
import createPresenceSwitchSignal from "../src/createPresenceSwitch";
import "uno.css";

const App: Component = () => {
  return (
    <>
      <FirstExample />
      <SecondExample />
    </>
  );
};

const FirstExample = () => {
  const [showStuff, setShowStuff] = createSignal(true);
  const { isVisible, isMounted } = createPresenceSignal(showStuff, {
    transitionDuration: 500,
  });

  return (
    <div
      style={{
        padding: "2em",
        margin: "2em",
        "border-radius": "2em",
        "box-shadow": "-5px 0px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <button onclick={() => setShowStuff(!showStuff())}>{`${
        showStuff() ? "Hide" : "Show"
      } stuff`}</button>
      <Show when={isMounted()}>
        <div
          style={{
            transition: "all .5s ease",
            opacity: isVisible() ? "1" : "0",
            transform: isVisible() ? "translateX(0)" : "translateX(50px)",
          }}
        >
          I am the stuff!
        </div>
      </Show>
    </div>
  );
};

const SecondExample = () => {
  const items = ["foo", "bar", "baz", "qux"];
  const [item, setItem] = createSignal<(typeof items)[number] | undefined>(items[0]);
  const { isMounted, mountedItem, isEntering, isVisible, isExiting } = createPresenceSwitchSignal(
    item,
    {
      transitionDuration: 500,
    },
  );

  return (
    <div
      style={{
        padding: "2em",
        margin: "2em",
        "border-radius": "2em",
        "box-shadow": "-5px 0px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <For each={items}>
        {currItem => (
          <button
            onclick={() => {
              if (item() === currItem) {
                setItem(undefined);
              } else {
                setItem(currItem);
              }
            }}
          >
            {currItem}
          </button>
        )}
      </For>
      <Show when={isMounted()}>
        <div
          style={{
            transition: "all .5s linear",
            ...(isEntering() && {
              opacity: "0",
              transform: "translateX(-25px)",
            }),
            ...(isExiting() && {
              opacity: "0",
              transform: "translateX(25px)",
            }),
            ...(isVisible() && {
              opacity: "1",
              transform: "translateX(0)",
            }),
          }}
        >
          {mountedItem()}
        </div>
      </Show>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

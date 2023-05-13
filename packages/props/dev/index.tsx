import { Component, ComponentProps, createSignal, Show } from "solid-js";

import { combineProps } from "../src";

const Button = (props: ComponentProps<"button">) => {
  const combinedProps = combineProps(
    combineProps(
      combineProps(
        combineProps(props, {
          class: "btn",
          onClick: () => console.log("click"),
          type: "button" as const,
          onmouseenter: () => console.log("mouse enter"),
          onmouseleave: () => console.log("mouse leave"),
          style: {
            color: "#eee",
          },
        }),
        {
          onClick: () => console.log("click 2"),
          onmouseenter: () => console.log("mouse enter 2"),
          "aria-label": "button",
          style: {
            padding: "8px 16px",
          },
        },
      ),
      {
        onClick: () => console.log("click 3"),
        onkeydown: () => console.log("key down"),
        "aria-label": "button 2",
      },
    ),
    {
      onClick: () => console.log("click 4"),
      onkeydown: () => console.log("key down 2"),
      "aria-label": "button 3",
      class: "btn-primary",
      style: {
        color: "#fff",
      },
    },
  );

  return <button {...combinedProps} />;
};

const App: Component = () => {
  const [show, setShow] = createSignal(true);

  const [count, setCount] = createSignal(0);
  const increment = () => setCount(count() + 1);

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <button onClick={() => setShow(!show())}>Toggle</button>
        <Show when={show()}>
          {Array.from({ length: 2000 }, (_, i) => (
            <Button class="btn-primary" onClick={increment}>
              {i}_{count()}
            </Button>
          ))}
        </Show>
      </div>
    </div>
  );
};

export default App;

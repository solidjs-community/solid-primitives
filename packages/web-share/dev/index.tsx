import { Component, createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

import { createWebShare } from "../src/index";

const App: Component = () => {
  const [data, setData] = createSignal<ShareData>({});

  const shareStatus = createWebShare(data);

  createEffect(() => {
    console.log(shareStatus.status);
  })

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Web Share component</h4>
        <p>share data: [ url: "https://solidjs.com" ]</p>
        <p class="caption">
          {shareStatus.status === undefined
            ? "Haven't started sharing yet."
            : shareStatus.status
            ? "Sharing success"
            : `Sharing failed, ${shareStatus.message}`}
        </p>
        <button class="btn" onClick={() => setData({ url: "https://solidjs.com" })}>
          Share
        </button>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

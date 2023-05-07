import { Component, createEffect, createSignal } from "solid-js";

import { createWebShare } from "../src/index";

const App: Component = () => {
  const [data, setData] = createSignal<ShareData>({});
  const shareStatus = createWebShare(data);

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
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

export default App;

import { Component, createSignal, createEffect } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

import { createWebShare } from "../src/index";

const App: Component = () => {
  const [shareInfo, setShareInfo] = createSignal<string>("");
  const [filesShareInfo, setFilesShareInfo] = createSignal<string>("");

  const onSharing = () => {
    const shareStatus = createWebShare({ url: "https://solidjs.com" });
    createEffect(() => {
      if (shareStatus() === "pending") {
        setShareInfo("sharing...");
      } else if (shareStatus() === "fulfilled") {
        setShareInfo("successful sharing.");
      } else {
        setShareInfo("bad sharing.");
      }
    });
  };

  const onFilesSharing = () => {
    const files = [new File([new Blob(["text"])], "file.txt")];
    const shareStatus = createWebShare({ files });
    createEffect(() => {
      if (shareStatus() === "pending") {
        setFilesShareInfo("sharing...");
      } else if (shareStatus() === "fulfilled") {
        setFilesShareInfo("successful sharing.");
      } else {
        setFilesShareInfo("bad sharing.");
      }
    });
  };

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Web Share component</h4>
        <p>share data: [ url: "https://solidjs.com" ]</p>
        <p class="caption">{shareInfo()}</p>
        <button class="btn" onClick={() => onSharing()}>
          Share
        </button>

        <h4>Web Share component: Files</h4>
        <p>share data: [ files: [file.txt] ]</p>
        <p class="caption">{filesShareInfo()}</p>
        <button class="btn" onClick={() => onFilesSharing()}>
          Share Files
        </button>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

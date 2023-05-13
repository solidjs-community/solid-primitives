import { Component } from "solid-js";

import { createPermission } from "../src";

const App: Component = () => {
  const micPermission = createPermission("microphone");
  const camPermission = createPermission("camera");

  const requestPermission = (constraints: MediaStreamConstraints) =>
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => stream.getTracks().forEach(track => track.stop()))
      .catch(console.warn);

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Microphone permission:</h4>
        <p>{micPermission}</p>
        <h4>Camera permission:</h4>
        <p>{camPermission}</p>
        <h4>Request permissions:</h4>
        <button onClick={() => requestPermission({ audio: true })}>Microphone</button>
        <button onClick={() => requestPermission({ video: true })}>Camera</button>
        <button onClick={() => requestPermission({ audio: true, video: true })}>Both</button>
      </div>
    </div>
  );
};

export default App;

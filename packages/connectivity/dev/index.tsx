import type { Component } from "solid-js";

import { createConnectivitySignal } from "../src";

const App: Component = () => {
  const onLine = createConnectivitySignal();
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center p-24">
      You are currently: {onLine() ? <strong>online</strong> : <strong>offline</strong>} (try
      toggling your network state in dev tools!)
    </div>
  );
};

export default App;

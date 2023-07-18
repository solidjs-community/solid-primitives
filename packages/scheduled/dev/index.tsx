import { Component, createSignal } from "solid-js";
import { Dynamic } from "solid-js/web";
import Reactive from "./reactive";
import Timeline from "./timeline";

const App: Component = () => {
  type Page = typeof Timeline | typeof Reactive;

  const [page, setPage] = createSignal<Page>(Timeline);

  return (
    <div class="min-h-screen overflow-hidden bg-gray-900 text-white">
      <nav class="m-2 flex space-x-4">
        <button class="text-yellow-400" onClick={() => setPage(() => Timeline)}>
          Timeline
        </button>
        <button class="text-yellow-400" onClick={() => setPage(() => Reactive)}>
          createScheduled
        </button>
      </nav>
      <Dynamic component={page()} />
    </div>
  );
};

export default App;

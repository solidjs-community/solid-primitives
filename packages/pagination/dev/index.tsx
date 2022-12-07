import { Component, For } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { createPagination } from "../src";

const App: Component = () => {
  const [paginationProps, page, setPage] = createPagination({ pages: 100 });

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Pagination component</h4>
        <p>Current page: {page()} / 100</p>
        <nav class="flex flex-row">
          <For each={paginationProps()}>{props => <button {...props} />}</For>
        </nav>
        <button onClick={() => setPage(Math.round(Math.random() * 100 + 1))}>
          jump to random page
        </button>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

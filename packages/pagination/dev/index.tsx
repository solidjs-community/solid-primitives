import { Component, For, Show } from "solid-js";

import { createInfiniteScroll, createPagination } from "../src/index.js";

async function fetcher(page: number) {
  let elements: string[] = [];
  let res = await fetch(`https://openlibrary.org/search.json?q=hello%20world&page=${page + 1}`, {
    method: "GET",
  });
  if (res.ok) {
    let json = await res.json();
    json.docs.forEach((b: any) => elements.push(b.title));
  }
  return elements;
}

const PaginationDemo: Component = () => {
  const [paginationProps, page, setPage] = createPagination({ pages: 100 });

  return (
      <div class="box-border flex w-1/2 flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
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


const InfiniteScrollDemo = () => {
  const [pages, infiniteScrollLoader, { end }] = createInfiniteScroll(fetcher);
  infiniteScrollLoader;
  return (
    <div class="flex max-h-screen w-1/2 flex-col bg-gray-800 text-white">
      <div class="flex h-[10%] items-center justify-center overflow-scroll">
        <h1>Infinite Scrolling:</h1>
      </div>
      <div class="h-[90%] overflow-scroll">
        <For each={pages()}>{item => <p>{item}</p>}</For>
        <Show when={!end()}>
          <h1 use:infiniteScrollLoader>Loading...</h1>
        </Show>
      </div>
    </div>
  );
}

const App: Component = () => {
  return (
    <div class="flex min-h-screen w-full">
      <PaginationDemo />
      <InfiniteScrollDemo />
    </div>
  );
};

export default App;

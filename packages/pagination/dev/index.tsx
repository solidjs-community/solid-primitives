import { type Component, For, Show, createSignal } from "solid-js";

import { createInfiniteScroll, createSegment, createPagination } from "../src/index.js";

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

const PaginationSegmentationDemo: Component = () => {
  const items = Array.from({ length: 1000 }, (_, i) => i + 1);
  const [limit, setLimit] = createSignal(10);
  const [paginationProps, page, setPage] = createPagination(() => ({
    pages: Math.ceil(items.length / limit()),
    maxPages: 8,
    jumpPages: 10,
  }));
  const segment = createSegment(items, limit, page);

  return (
    <div class="mx-auto box-border flex w-1/2 flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <h4 class="text-xl">Pagination & Segmentation:</h4>
      <For each={segment()}>{i => <p class="border-1 w-full text-center">{i}</p>}</For>
      <nav class="flex flex-row">
        <For each={paginationProps()}>
          {props => <button class="whitespace-nowrap" {...props} />}
        </For>
      </nav>
      <div class="flex flex-row">
        <button onClick={() => setLimit(5)} disabled={limit() === 5}>
          5 items/page
        </button>
        <button onClick={() => setLimit(10)} disabled={limit() === 10}>
          10 items/page
        </button>
        <button onClick={() => setLimit(20)} disabled={limit() === 20}>
          20 items/page
        </button>
        <button onClick={() => setPage(Math.round((Math.random() * 1000) / limit() + 1))}>
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
    <div class="mx-auto mt-10 flex max-h-screen w-1/2 flex-col bg-gray-800 p-4 text-white">
      <div class="flex items-center justify-center">
        <h4 class="text-xl">Infinite Scrolling:</h4>
      </div>
      <div class="h-[90%] overflow-scroll">
        <For each={pages()}>{item => <p>{item}</p>}</For>
        <Show when={!end()}>
          <span use:infiniteScrollLoader>Loading...</span>
        </Show>
      </div>
    </div>
  );
};

const App: Component = () => {
  return (
    <div class="flex min-h-screen w-full flex-col">
      <PaginationSegmentationDemo />
      <InfiniteScrollDemo />
    </div>
  );
};

export default App;

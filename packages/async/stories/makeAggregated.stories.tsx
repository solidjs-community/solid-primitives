import { createAggregated } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import { createSignal, For, onCleanup } from "solid-js";

const meta = preview.meta({
  title: "Reactivity",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const Aggregation = meta.story({
  name: "createAggregated",
  parameters: {
    docs: {
      description: {
        story:
          "`createAggregated` aggregates the states of any accessor."
      }
    }
  },
  render: () => {
    const [currentPage, setCurrentPage] = createSignal(1);
    const pages = createAggregated(currentPage, []);
    const loadNextPage = () => setCurrentPage(page => page + 1);
    
    return <main id="pages">
      <ol>
        <For each={pages()}>
          {(page) => <li style="display: flex; min-height: 1.2vh; justify-content: center; align-items: center;">{page}</li>}
        </For>
      </ol>
      <button type="button" onClick={loadNextPage}>Load next page</button>
    </main>
  },
});
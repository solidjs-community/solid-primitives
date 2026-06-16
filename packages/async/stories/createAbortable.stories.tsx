import { createAbortable } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import data from "./data.json";
import { createMemo, createSignal, For, Loading } from "solid-js";

const meta = preview.meta({
  title: "Reactivity",
  parameters: {
    layout: "centered",
  },
});

export default meta;

declare global {
  class AbortError extends Error {}
}

export const CreateAbortableAutoSuggest = meta.story({
  name: "createAbortable AutoSuggest",
  parameters: {
    docs: {
      description: {
        story:
          "`createAbortable` automatically aborts subsequent requests and automatically aborts on next signal and cleanup, ideal for patterns like auto-suggest."
      }
    }
  },
  render: () => {
    if (!('AbortError' in globalThis)) {
      (globalThis as any).AbortError = class AbortError extends Error { 
        constructor(msg: string) { super(msg); }
      }
    }
    const autoSuggest = async (query: string, signal: AbortSignal) => {
      await new Promise(r => setTimeout(r, 500));
      if (signal.aborted) throw new AbortError("aborted");
      const fuzzy = new RegExp(query.replace(/./g, "$1.*?"), "i");
      return data.filter(term => fuzzy.test(term));
    }
    const [query, setQuery] = createSignal("");
    const [signal, abort, filterError] = createAbortable();
    const suggest = createMemo(() => autoSuggest(query(), signal()));
    
    return <Loading>
      <input 
        placeholder="type for autosuggest"
        onChange={(ev) => { setQuery(ev.currentTarget.value)}}
      />
      <ul>
        <For each={suggest()} fallback={<li>no suggestions found</li>}>
          {(suggestion) => <li>{suggestion}</li>}
        </For>
      </ul>
    </Loading>
  },
});
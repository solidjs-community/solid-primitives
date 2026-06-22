import { makeAbortable } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import data from "./data.json";
import { createMemo, createSignal, For, Loading, onCleanup } from "solid-js";

const meta = preview.meta({
  title: "Reactivity/Async",
  parameters: {
    layout: "centered",
  },
});

export default meta;

declare global {
  class AbortError extends Error {}
}

export const Abortable = meta.story({
  name: "makeAbortable AutoSuggest",
  parameters: {
    docs: {
      description: {
        story:
          "`makeAbortable` automatically aborts subsequent requests and automatically aborts on next signal, ideal for patterns like auto-suggest."
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
      await new Promise(r => setTimeout(r, 200));
      query = query.replace(/\W/, "");
      if (!query) return [];
      if (signal.aborted) throw new AbortError("aborted");
      const fuzzy = (term: string) => {
        let pos = -1, indices = [];
        for (const char of query) {
          pos = term.indexOf(char, pos + 1);
          indices.push(pos)
          if (pos === -1) return null;
        }
        return indices;
      }
      const terms = data.reduce((terms, term) => {
        if (signal.aborted) throw new AbortError("aborted");
        const indices = fuzzy(term);
        if (indices) {
          let letters: [string, boolean][] = [];
          [...term].forEach((c, i) => {
            const mark = indices.includes(i);
            if (letters.at(-1)?.[1] !== mark) {
              letters.push([c, mark]);
            } else {
              letters.at(-1)![0] += c;
            }
          });
          terms.push(letters);
        }
        return terms;
      }, [] as [string, boolean][][]);
      console.log(terms);
      return terms;
    }
    const [query, setQuery] = createSignal("");
    const [signal, abort, filterError] = makeAbortable();
    onCleanup(abort);
    const suggest = createMemo(() => autoSuggest(query(), signal()).catch(filterError));
    
    return <Loading>
      <input 
        placeholder="type for autosuggest"
        onInput={(ev) => { setQuery(ev.currentTarget.value)}}
      />
      <ul>
        <For each={suggest()} fallback={<li>no suggestions found</li>}>
          {(suggestion) => <li>
            <For each={suggestion}>
              {(letter) => letter[1] ? <strong>{letter[0]}</strong> : letter[0]}
            </For>
          </li>}
        </For>
      </ul>
    </Loading>
  },
});
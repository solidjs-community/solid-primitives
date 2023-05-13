import { Component, createResource, createSignal, For, onCleanup, Show } from "solid-js";

import { makeAbortable, makeCache, makeRetrying } from "../src";

const setsPath = "https://api.tcgdex.net/v2/en/sets";
const cardPath = "https://api.tcgdex.net/v2/en/cards";

type PokemonSetList = {
  cardCount: Record<string, number>;
  cards: {
    id: string;
    localId: string;
    name: string;
    image: string;
  }[];
  id: string;
  legal: {
    expanded: boolean;
    standard: boolean;
  };
  logo: string;
  name: string;
  releaseDate: string;
  serie: {
    id: string;
    name: string;
  };
  symbol: string;
}[];

const PokemonSets: Component = () => {
  const [signal, abort] = makeAbortable();
  const [setsFetcher] = makeCache(
    makeRetrying(() => fetch(setsPath, { signal: signal() }).then(r => r.json())),
    { expires: 356 * 24 * 60 * 60 * 1000, storage: localStorage },
  );
  const [sets] = createResource<PokemonSetList, string>(() => "sets", setsFetcher);
  onCleanup(abort);
  return (
    <Show when={!sets.error} fallback="...">
      <ul>
        <For each={sets() || []}>
          {card => (
            <li>
              <PokemonSet {...card} />
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
};

type PokemonSetData = {
  cardCount: Record<string, number>;
  cards: {
    id: string;
    localId: string;
    name: string;
    image: string;
  }[];
  id: string;
  legal: {
    expanded: boolean;
    standard: boolean;
  };
  logo: string;
  name: string;
  releaseDate: string;
  serie: {
    id: string;
    name: string;
  };
  symbol: string;
};

const PokemonSet = (props: PokemonSetList[number]) => {
  const [open, setOpen] = createSignal(false);
  const [signal, abort] = makeAbortable();
  const [setFetcher] = makeCache(
    makeRetrying<string, PokemonSetData>(url =>
      fetch(url, { signal: signal() }).then(r => r.json()),
    ),
    { expires: 356 * 24 * 60 * 60 * 1000, storage: localStorage },
  );
  const [set] = createResource(() => (open() ? `${setsPath}/${props.id}` : ""), setFetcher);
  onCleanup(abort);
  return (
    <>
      <button onClick={() => setOpen(!open())}>{open() ? "-" : "+"}</button>
      <Show when={props.logo}>
        <img src={props.logo} class="h-1.2em w-auto pl-2" />
      </Show>
      <span class="pl-2" onClick={() => setOpen(!open())}>
        {props.name}
      </span>
      <Show when={open() && set.loading}>...</Show>
      <Show when={open() && set()}>
        <>
          <ul>
            <For each={set()?.cards || []}>
              {card => (
                <li>
                  <PokemonCard {...card} />
                </li>
              )}
            </For>
          </ul>
        </>
      </Show>
    </>
  );
};

type PokemonCardInfo = {
  id: string;
  localId: string;
  name: string;
  image: string;
};

type PokemonCardData = {
  category: string;
  id: string;
  illustrator: string;
  image: string;
  localId: string;
  name: "Alakazam";
  rarity: "Rare";
  set: {
    cardCount: {
      official: number;
      total: number;
    };
    id: string;
    logo: string;
    name: string;
  };
  variants: Record<string, boolean>;
  dexId: number[];
  hp: number;
  types: string[];
  evolveFrom: string;
  stage: string;
  abilities: Record<string, string>[];
  attacks: Record<string, any>[];
  weaknesses: { type: string; value: string }[];
  retreat: number;
  legal: { standard: boolean; expanded: boolean };
};

const PokemonCard = (props: PokemonCardInfo) => {
  const [open, setOpen] = createSignal(false);
  const [signal, abort] = makeAbortable();
  const [cardFetcher] = makeCache(
    makeRetrying<string, PokemonCardData>(url =>
      fetch(url, { signal: signal() }).then(r => r.json()),
    ),
    { expires: 356 * 24 * 60 * 60 * 1000, storage: localStorage },
  );
  const [card] = createResource(() => (open() ? `${cardPath}/${props.id}` : ""), cardFetcher);
  onCleanup(abort);
  return (
    <>
      <button onClick={() => setOpen(!open())}>{open() ? "-" : "+"}</button>
      <span class="pl-2" onClick={() => setOpen(!open())}>
        {props.name}
      </span>
      <Show when={open() && card.loading}>...</Show>
      <Show when={open() && card()}>
        <Show when={card()?.image}>
          <>
            <br />
            <img src={card()?.image + "/low.jpg"} />
          </>
        </Show>
      </Show>
    </>
  );
};

const App: Component = () => {
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h2>Pokemon cards</h2>
        <PokemonSets />
      </div>
    </div>
  );
};

export default App;

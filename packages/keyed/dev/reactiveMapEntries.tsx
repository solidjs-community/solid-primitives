import { createStore } from "solid-js/store";
import { createEffect } from "solid-js";
import { MapEntries } from "../src/index.js";
import { TransitionGroup } from "solid-transition-group";
import { ReactiveMap } from "@solid-primitives/map";

const foods = [
  "oatmeal",
  "plantains",
  "cranberries",
  "chickpeas",
  "tofu",
  "Parmesan cheese",
  "amaretto",
  "sunflower seeds",
  "grapes",
  "vegemite",
  "pasta",
  "cider",
  "chicken",
  "pinto beans",
  "bok choy",
  "sweet peppers",
  "Cappuccino Latte",
  "corn",
  "broccoli",
  "brussels sprouts",
  "bread",
  "milk",
  "honey",
  "chips",
  "cookie",
];
const randomIndex = (list: readonly any[]): number => Math.floor(Math.random() * list.length);
const getRandomFood = () => foods[randomIndex(foods)]!;
const randomKey = (map: ReactiveMap<string, string>): string => {
  const keys = Array.from(map.keys());
  return keys[randomIndex(keys)]!;
};

export default function App() {
  const [store, setStore] = createStore<{ entries: ReactiveMap<string, string> }>({
    entries: new ReactiveMap([
      [Math.random().toString(), "bread"],
      [Math.random().toString(), "milk"],
      [Math.random().toString(), "honey"],
      [Math.random().toString(), "chips"],
      [Math.random().toString(), "cookie"],
    ]),
  });

  const addRandom = () => {
    store.entries.set(Math.random().toString(), getRandomFood());
  };
  const removeRandom = () => store.entries.delete(randomKey(store.entries));
  const clone = () => setStore("entries", p => new ReactiveMap(p));
  const changeRandomValue = () => store.entries.set(randomKey(store.entries), getRandomFood());

  return (
    <>
      <div class="wrapper-h">
        <button class="btn" onclick={addRandom}>
          Add
        </button>
        <button class="btn" onclick={removeRandom}>
          Remove
        </button>
        <button class="btn" onclick={changeRandomValue}>
          Change value
        </button>
        <button class="btn" onclick={clone}>
          Clone
        </button>
      </div>
      <div class="wrapper-h flex-wrap">
        <TransitionGroup name="fade">
          <MapEntries
            of={store.entries}
            fallback={<p class="bg-yellow-500 p-1 transition-all">No items.</p>}
          >
            {(key, value, index) => {
              createEffect(() => {
                console.log("Effect:", key, value());
              });
              return (
                <div class="node relative transition-all duration-500">
                  {index()}. {value()}
                  <div class="bg-dark-500 text-light-900 absolute -bottom-2 left-2 px-1 text-[9px]">
                    ID: {key}
                  </div>
                </div>
              );
            }}
          </MapEntries>
        </TransitionGroup>
      </div>
    </>
  );
}

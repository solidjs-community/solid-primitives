// changes to this file might be applicable to similar files - grep 95DB7339-BB2A-4F06-A34A-25DDF8BF7AF7

import { createEffect, createSignal } from "solid-js";
import { MapEntries } from "../src/index.js";
import { TransitionGroup } from "solid-transition-group";

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
const randomKey = (map: Map<string, string>): string => {
  const keys = Array.from(map.keys());
  return keys[randomIndex(keys)]!;
};

export default function App() {
  const [map, setMap] = createSignal(
    new Map([
      [Math.random().toString(), "bread"],
      [Math.random().toString(), "milk"],
      [Math.random().toString(), "honey"],
      [Math.random().toString(), "chips"],
      [Math.random().toString(), "cookie"],
    ]),
  );

  const addRandom = () => {
    setMap(p => {
      p.set(Math.random().toString(), getRandomFood());
      return new Map(p);
    });
  };
  const removeRandom = () =>
    setMap(p => {
      p.delete(randomKey(p));
      return new Map(p);
    });
  const clone = () => setMap(p => new Map(p));
  const changeRandomValue = () =>
    setMap(p => {
      p.set(randomKey(p), getRandomFood());
      return new Map(p);
    });

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
            of={map()}
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

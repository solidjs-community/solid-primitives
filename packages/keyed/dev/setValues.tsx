// changes to this file might be applicable to similar files - grep 95DB7339-BB2A-4F06-A34A-25DDF8BF7AF7

import { createEffect, createSignal } from "solid-js";
import { SetValues } from "../src/index.js";
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
const randomValue = (map: Set<string>): string => {
  const values = Array.from(map.values());
  return values[randomIndex(values)]!;
};

export default function App() {
  const [set, setSet] = createSignal(new Set(["bread", "milk", "honey", "chips", "cookie"]));

  const addRandom = () => {
    setSet(p => {
      p.add(getRandomFood());
      return new Set(p);
    });
  };
  const removeRandom = () =>
    setSet(p => {
      p.delete(randomValue(p));
      return new Set(p);
    });
  const clone = () => setSet(p => new Set(p));

  return (
    <>
      <div class="wrapper-h">
        <button class="btn" onclick={addRandom}>
          Add
        </button>
        <button class="btn" onclick={removeRandom}>
          Remove
        </button>
        <button class="btn" onclick={clone}>
          Clone
        </button>
      </div>
      <div class="wrapper-h flex-wrap">
        <TransitionGroup name="fade">
          <SetValues
            of={set()}
            fallback={<p class="bg-yellow-500 p-1 transition-all">No items.</p>}
          >
            {(value, index) => {
              createEffect(() => {
                console.log("Effect:", value);
              });
              return (
                <div class="node relative transition-all duration-500">
                  {index()}. {value}
                  <div class="bg-dark-500 text-light-900 absolute -bottom-2 left-2 px-1 text-[9px]">
                    {value}
                  </div>
                </div>
              );
            }}
          </SetValues>
        </TransitionGroup>
      </div>
    </>
  );
}

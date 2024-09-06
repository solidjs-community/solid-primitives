import { splice, update } from "@solid-primitives/utils/immutable";
import { createEffect, createSignal } from "solid-js";
import { Key } from "../src/index.js";
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
const getRandomFood = () => foods[randomIndex(foods)];

export default function App() {
  const [list, setList] = createSignal<{ id: number; value: string }[]>([
    { id: 1, value: "bread" },
    { id: 2, value: "milk" },
    { id: 3, value: "honey" },
    { id: 4, value: "chips" },
    { id: 5, value: "cookie" },
  ]);

  const addRandom = () => {
    for (let i = 0; i <= list().length; i++) {
      const is = list().find(item => i === item.id);
      if (!is) {
        setList(p => splice(p, i, 0, { id: i, value: getRandomFood() }));
        return;
      }
    }
  };
  const removeRandom = () => setList(p => splice(p, randomIndex(p), 1));
  const shuffle = () => setList(p => p.slice().sort(() => Math.random() - 0.5));
  const cloneList = () => setList(p => JSON.parse(JSON.stringify(p)));
  const changeRandomValue = () => setList(p => update(p, randomIndex(p), "value", getRandomFood()));

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
        <button class="btn" onclick={shuffle}>
          Shuffle
        </button>
        <button class="btn" onclick={cloneList}>
          Clone list
        </button>
      </div>
      <div class="wrapper-h flex-wrap">
        <TransitionGroup name="fade">
          <Key
            each={list()}
            by="id"
            fallback={<p class="bg-yellow-500 p-1 transition-all">No items in the list.</p>}
          >
            {(item, index) => {
              createEffect(() => {
                console.log("Effect:", item().id, item().value);
              });
              return (
                <div class="node relative transition-all duration-500">
                  {index()}. {item().value}
                  <div class="bg-dark-500 text-light-900 absolute -bottom-2 left-2 px-1">
                    ID: {item().id}
                  </div>
                </div>
              );
            }}
          </Key>
        </TransitionGroup>
      </div>
    </>
  );
}

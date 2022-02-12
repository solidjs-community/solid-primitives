import { Refs } from "@solid-primitives/refs";
import { splice } from "@solid-primitives/immutable";
import { createSignal } from "solid-js";
import { Key } from "../src";

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
  "cookie"
];
const getRandomFood = () => foods[Math.floor(Math.random() * foods.length)];

export default function App() {
  const [list, setList] = createSignal<{ id: number; value: string }[]>([
    { id: 1, value: "bread" },
    { id: 2, value: "milk" },
    { id: 3, value: "honey" },
    { id: 4, value: "chips" },
    { id: 5, value: "cookie" }
  ]);

  const addRandom = () => {
    for (let i = 0; i <= list().length; i++) {
      const is = list().find(item => i === item.id);
      if (!is) {
        setList(p => splice(p, i, 0, { id: i, value: getRandomFood() }));
      }
    }
  };

  const [aliveCheck, setAliveCheck] = createSignal("/");
  setInterval(() => setAliveCheck(p => (p === "/" ? "\\" : "/")), 500);

  return (
    <>
      <div class="wrapper-h">
        <button class="btn" onclick={addRandom}>
          Add random
        </button>
        <button class="btn">Remove random</button>
        <button class="btn">Shuffle</button>
      </div>
      <div class="wrapper-h">
        <Refs
          onChange={({ added, removed }) =>
            console.log("Added:", added.length, "| Removed:", removed.length)
          }
        >
          <Key
            each={list()}
            by={item => item.id}
            fallback={
              <p class="bg-yellow-500">
                {aliveCheck()} No items in the list. {aliveCheck()}
              </p>
            }
          >
            {(item, index) => (
              <div class="node relative">
                {index()}. {item().value}
                <div class="absolute -bottom-2 left-2 px-1 bg-dark-500 text-light-900">
                  ID: {item().id} {aliveCheck()}
                </div>
              </div>
            )}
          </Key>
        </Refs>
      </div>
    </>
  );
}

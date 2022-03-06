import { destructure, spread } from "../src";
import { Component, createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const Inner: Component<{ seconds: number; count: number; list: number[] }> = props => {
  const { seconds, count } = destructure(props);

  createEffect(() => console.log("Seconds", seconds()));
  createEffect(() => console.log("Count", count()));

  const list = spread(() => props.list);
  const [n0, n1] = list;

  createEffect(() => console.log("0:", n0()));
  createEffect(() => console.log("1:", n1()));
  createEffect(() => console.log("2:", list[2]()));

  return <></>;
};

const App: Component = () => {
  const [seconds, setSeconds] = createSignal(0);
  setInterval(() => setSeconds(p => ++p), 1000);

  const [count, setCount] = createSignal(0);

  const [list, setList] = createSignal([1, 2, 3]);
  const shuffle = () => setList(p => p.slice().sort(() => Math.random() - 0.5));
  setInterval(shuffle, 2000);

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v" onclick={() => setCount(p => ++p)}>
        <button class="btn">{count()}</button>
      </div>
      <Inner seconds={seconds()} count={count()} list={list()} />
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

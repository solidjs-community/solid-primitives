import { Rerun } from "../src";
import { Component, createSignal } from "solid-js";
import { Transition } from "solid-transition-group";
import { Fn } from "@solid-primitives/utils";

const base = { opacity: 1, transform: "translate(0)" };
const options = { duration: 300 };
const animateIn = (el: Element, done: Fn) => {
  el.animate([{ opacity: 0, transform: "translate(12px)" }, base], options).finished.then(done);
};
const animateOut = (el: Element, done: Fn) =>
  el.animate([base, { opacity: 0, transform: "translate(-12px)" }], options).finished.then(done);

const Button: Component<{ onClick: Fn }> = props => {
  console.log("new button");

  return (
    <button class="btn" onClick={props.onClick}>
      {props.children}
    </button>
  );
};

const App: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <div class="wrapper-h">
        <Transition onEnter={animateIn} onExit={animateOut} mode="outin">
          <Rerun on={count()}>
            <Button onClick={() => setCount(p => ++p)}>{count()}</Button>
            {/* <button class="btn" onClick={() => setCount(p => ++p)}>
            </button> */}
            {/* {count => (
            )} */}
          </Rerun>
        </Transition>
      </div>
    </>
  );
};
export default App;

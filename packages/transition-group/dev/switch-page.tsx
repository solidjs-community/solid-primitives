import { Component, createSignal, JSX, onCleanup, ParentProps, Show } from "solid-js";
import { resolveFirst } from "@solid-primitives/refs";
import { createSwitchTransition, TransitionMode } from "../src";

function Transition(props: ParentProps & { mode: TransitionMode }): JSX.Element {
  const el = resolveFirst(
    () => props.children,
    (item): item is HTMLElement => item instanceof HTMLElement,
  );

  const animateIn = (el: HTMLElement, done: VoidFunction) => {
    if (!el.isConnected) throw el.textContent + " is not connected!!";
    const a = el.animate(
      [
        { opacity: 0, transform: "translate(100px)" },
        { opacity: 1, transform: "translate(0)" },
      ],
      { duration: 800 },
    );
    animationMap.set(el, a);
    const complete = () => {
      done();
      animationMap.delete(el);
    };
    a.finished.then(complete).catch(complete);
  };

  const animateOut = (el: HTMLElement, done: VoidFunction) => {
    if (!el.isConnected) throw el.textContent + " is not connected!!";
    const left1 = el.getBoundingClientRect().left;
    animationMap.get(el)?.cancel();
    const left2 = el.getBoundingClientRect().left;
    el.animate(
      [
        { opacity: 1, transform: `translate(${left1 - left2}px)` },
        { opacity: 0, transform: "translate(-100px)" },
      ],
      { duration: 1000 },
    )
      .finished.then(done)
      .catch(done);
  };

  const animationMap = new Map<Element, Animation>();

  return createSwitchTransition(el, {
    onEnter(el, done) {
      // console.log("onEnter", el);
      requestAnimationFrame(() => {
        animateIn(el, done);
      });
    },
    onExit(el, done) {
      // console.log("onExit", el);
      animateOut(el, done);
    },
    mode: props.mode,
  });
}

const grayOutOnDispose = (el: HTMLElement) => {
  onCleanup(() => {
    el.style.filter = "grayscale(60%)";
    el.style.zIndex = "0";
  });
};

function Example(props: { mode: TransitionMode; withFallback?: true }): JSX.Element {
  const { withFallback, mode } = props;
  const [toggle, setToggle] = createSignal(true);

  let i = 0;

  return (
    <div class="wrapper-h h-26 relative">
      <h4 class="absolute m-auto pointer-events-none">{mode}</h4>
      <button class="btn absolute left-16" onClick={() => setToggle(!toggle())}>
        {toggle() ? "Hide" : "Show"}
      </button>
      <Transition mode={mode}>
        <Show
          when={toggle()}
          fallback={
            withFallback && (
              <div class="absolute z-1 right-16 p-4 bg-orange-600 rounded" ref={grayOutOnDispose}>
                B{i++}
              </div>
            )
          }
        >
          <div class="absolute z-1 right-16 p-4 bg-green-600 rounded" ref={grayOutOnDispose}>
            A{i++}
          </div>
        </Show>
      </Transition>
    </div>
  );
}

const SwitchPage: Component = () => {
  return (
    <>
      <h1>Toggle</h1>
      <Example mode="parallel" />
      <Example mode="out-in" />
      <Example mode="in-out" />
      <h1>Switch</h1>
      <Example mode="parallel" withFallback />
      <Example mode="out-in" withFallback />
      <Example mode="in-out" withFallback />
    </>
  );
};

export default SwitchPage;

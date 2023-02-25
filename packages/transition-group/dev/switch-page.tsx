import { Component, createSignal, onCleanup, Show, untrack } from "solid-js";
import { resolveFirst } from "@solid-primitives/refs";
import { createSwitchTransition } from "../src";

const SwitchPage: Component = () => {
  const [toggle, setToggle] = createSignal(true);

  return (
    <>
      <div class="wrapper-h flex-wrap">
        <button class="btn" onClick={() => setToggle(!toggle())}>
          {toggle() ? "Hide" : "Show"}
        </button>
      </div>
      <div class="wrapper-h h-16">
        {untrack(() => {
          let i = 0;

          const el = resolveFirst(
            () => (
              <Show
                when={toggle()}
                fallback={
                  <div
                    class="p-4 bg-orange-600 rounded"
                    ref={el => onCleanup(() => (el.style.filter = "grayscale(60%)"))}
                  >
                    B{i++}
                  </div>
                }
              >
                <div
                  class="p-4 bg-green-600 rounded"
                  ref={el => onCleanup(() => (el.style.filter = "grayscale(60%)"))}
                >
                  A{i++}
                </div>
              </Show>
            ),
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
            el.style.position = "absolute";
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
            // mode: "in-out",
            appear: false,
          });
        })}
      </div>
    </>
  );
};

export default SwitchPage;

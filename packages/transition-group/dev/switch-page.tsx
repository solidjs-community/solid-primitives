import {
  Component,
  createRenderEffect,
  createResource,
  createSignal,
  JSX,
  onCleanup,
  ParentProps,
  Show,
  Suspense,
  untrack,
} from "solid-js";
import { resolveFirst } from "@solid-primitives/refs";
import { createSwitchTransition, TransitionMode } from "../src";

function Transition(props: ParentProps & { mode: TransitionMode }): JSX.Element {
  const el = resolveFirst(
    () => props.children,
    (item): item is HTMLElement => item instanceof HTMLElement,
  );

  const animateIn = (el: HTMLElement, done: VoidFunction) => {
    if (!el.isConnected) console.warn(el.textContent + " is not connected on enter!!");
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
    if (!el.isConnected) console.warn(el.textContent + " is not connected on exit!!");
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
    // appear: true,
  });
}

const grayOutOnDispose = (el: HTMLElement) => {
  onCleanup(() => {
    el.style.filter = "grayscale(60%)";
    el.style.zIndex = "0";
  });
};

function Example(props: {
  mode: TransitionMode;
  withFallback?: true;
  resource: VoidFunction;
}): JSX.Element {
  const { withFallback, mode } = props;
  const [toggle, setToggle] = createSignal(true);

  let i = 0;

  return (
    <div class="wrapper-h h-26 relative">
      <h4 class="absolute m-auto pointer-events-none">{mode}</h4>
      <button class="btn absolute left-16" onClick={() => setToggle(!toggle())}>
        {toggle() ? "Hide" : "Show"}
      </button>
      <Suspense fallback={<p class="absolute right-16">Suspended</p>}>
        {untrack(() => {
          // track the resource
          createRenderEffect(props.resource);

          return (
            <Transition mode={mode}>
              <Show
                when={toggle()}
                fallback={
                  withFallback && (
                    <div
                      class="absolute z-1 right-16 p-4 bg-orange-600 rounded"
                      ref={grayOutOnDispose}
                    >
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
          );
        })}
      </Suspense>
    </div>
  );
}

const SwitchPage: Component = () => {
  const [runResource, setRunResource] = createSignal(false);
  let resolve = () => {};
  const [res] = createResource(runResource, () => new Promise<void>(r => (resolve = r)));

  return (
    <>
      <button
        class="btn"
        onClick={() => {
          resolve();
          setRunResource(p => !p);
        }}
      >
        {runResource() ? "Stop" : "Start"} Resource
      </button>
      <h1>Toggle</h1>
      <Example mode="parallel" resource={res} />
      <Example mode="out-in" resource={res} />
      <Example mode="in-out" resource={res} />
      <h1>Switch</h1>
      <Example mode="parallel" withFallback resource={res} />
      <Example mode="out-in" withFallback resource={res} />
      <Example mode="in-out" withFallback resource={res} />
    </>
  );
};

export default SwitchPage;

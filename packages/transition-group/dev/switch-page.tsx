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

// const appear = localStorage.getItem("transition-group-appear") === "true";
const appear = true;

function Transition(props: ParentProps & { mode: TransitionMode }): JSX.Element {
  const el = resolveFirst(
    () => props.children,
    (item): item is HTMLElement => item instanceof HTMLElement,
  );

  const animateIn = (el: HTMLElement, done: VoidFunction) => {
    if (!el.isConnected) return done();
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
    if (!el.isConnected) return done();
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

  const transition = createSwitchTransition(el, {
    onEnter(el, done) {
      queueMicrotask(() => animateIn(el, done));
    },
    onExit(el, done) {
      animateOut(el, done);
    },
    mode: props.mode,
    appear,
  });

  return <>{transition()}</>;
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
      <h4 class="pointer-events-none absolute m-auto">{mode}</h4>
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
                      class="z-1 absolute right-16 rounded bg-orange-600 p-4"
                      ref={grayOutOnDispose}
                    >
                      B{i++}
                    </div>
                  )
                }
              >
                <div class="z-1 absolute right-16 rounded bg-green-600 p-4" ref={grayOutOnDispose}>
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
      <div class="flex">
        <button
          class="btn"
          onClick={() => {
            resolve();
            setRunResource(p => !p);
          }}
        >
          {runResource() ? "Stop" : "Start"} Resource
        </button>
        <button
          class="btn"
          onClick={() => {
            localStorage.setItem("transition-group-appear", String(!appear));
            window.location.reload();
          }}
        >
          {appear ? "Disable" : "Enable"} Appear
        </button>
      </div>
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

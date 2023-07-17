import {
  createEffect,
  createRenderEffect,
  createResource,
  mapArray,
  onCleanup,
  onMount,
  Suspense,
  untrack,
  useTransition,
} from "solid-js";
import { resolveElements } from "@solid-primitives/refs";
import { Component, createSignal, For, Show } from "solid-js";
import { createListTransition } from "../src";

const grayOutOnDispose = (el: HTMLElement) => {
  onCleanup(() => {
    el.style.filter = "grayscale(60%)";
    el.style.zIndex = "0";
  });
};

const ListPage: Component = () => {
  const [show, setShow] = createSignal(false);
  const [show1, setShow1] = createSignal(false);
  const [show2, setShow2] = createSignal(true);
  const [showWrapper, setShowWrapper] = createSignal(true);

  const [list, setList] = createSignal([{ n: 1 }, { n: 2 }, { n: 3 }, { n: 4 }, { n: 5 }]);

  const [runResource, setRunResource] = createSignal(false);
  let resolve = () => {};
  const [res] = createResource(runResource, () => new Promise<void>(r => (resolve = r)));
  const [isTransitioning, startTransition] = useTransition();

  // const appear = localStorage.getItem("transition-group-appear") === "true";
  const appear = true;

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
            resolve();
            runResource() || startTransition(() => setRunResource(p => !p));
          }}
        >
          {isTransitioning() ? "Stop" : "Start"} Transition
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

      <div class="wrapper-h flex-wrap">
        <button
          class="btn"
          onclick={() => setList(p => [...p, { n: (p[p.length - 1]?.n ?? -1) + 1 }])}
        >
          + 1
        </button>
        <button
          class="btn"
          onclick={() => setList(p => (p.length > 0 ? p.slice(0, p.length - 1) : p))}
        >
          - 1
        </button>
        <button class="btn" onclick={() => setShow(p => !p)}>
          toggle 0
        </button>
        <button class="btn" onclick={() => setShow1(p => !p)}>
          toggle 1
        </button>
        <button class="btn" onclick={() => setShow2(p => !p)}>
          toggle 2 & 3
        </button>
        <button class="btn" onclick={() => setShowWrapper(p => !p)}>
          toggle wrapper
        </button>
      </div>
      <div class="wrapper-h flex-wrap gap-4 space-x-0">
        <Suspense fallback={<p>Suspended</p>}>
          <Show when={showWrapper()}>
            {untrack(() => {
              // track the resource
              createRenderEffect(res);

              const resolved = resolveElements(
                () => (
                  <>
                    <p>Hello</p>
                    World
                    {show() && (
                      <div
                        class="node"
                        ref={el => {
                          onMount(() => console.log("mounted", el.isConnected));
                          grayOutOnDispose(el);
                        }}
                      >
                        ID 0
                      </div>
                    )}
                    <Show when={show1()}>
                      <div class="node" ref={grayOutOnDispose}>
                        ID 1
                      </div>
                    </Show>
                    <Show when={show2()}>
                      <div class="node" ref={grayOutOnDispose}>
                        ID 2
                      </div>
                      <div class="node" ref={grayOutOnDispose}>
                        ID 3
                      </div>
                    </Show>
                    <For each={list()}>
                      {({ n }, i) => (
                        <div
                          class="node cursor-pointer bg-yellow-600"
                          data-index={i()}
                          onClick={() =>
                            setList(p => {
                              const copy = p.slice();
                              copy.splice(i(), 1);
                              return copy;
                            })
                          }
                          ref={grayOutOnDispose}
                        >
                          {n + 1}.
                        </div>
                      )}
                    </For>
                  </>
                ),
                (el): el is HTMLElement => el instanceof HTMLElement,
              );

              const options = { duration: 1000, easing: "cubic-bezier(0.4, 0, 0.2, 1)" };

              const transition = createListTransition(resolved.toArray, {
                appear,
                interruptMethod: "wait",
                exitMethod: "keep-index",
              });

              const els = mapArray(transition, ([el, { state, useOnEnter, useOnExit }]) => {
                createEffect(() => {
                  console.log("state", state(), el);
                });

                useOnEnter(done => {
                  console.log("onEnter", el);

                  for (const animation of el.getAnimations()) {
                    animation.commitStyles();
                    animation.cancel();
                  }

                  const animation = el.animate(
                    [
                      { opacity: 0, transform: "translateY(-30px)" },
                      { opacity: 1, transform: "translateY(0)" },
                    ],
                    { ...options, fill: "both" },
                  );

                  animation.finished.then(done).catch(done);
                });

                useOnExit(done => {
                  console.log("onExit", el);

                  for (const animation of el.getAnimations()) {
                    animation.commitStyles();
                    animation.cancel();
                  }

                  const animation = el.animate(
                    [
                      { opacity: 1, transform: "translateY(0)" },
                      { opacity: 0, transform: "translateY(30px)" },
                    ],
                    { ...options, fill: "both" },
                  );

                  animation.finished.then(done).catch(done);
                });

                return el;
              });

              return <>{els()}</>;
            })}
          </Show>
        </Suspense>
      </div>
    </>
  );
};

export default ListPage;

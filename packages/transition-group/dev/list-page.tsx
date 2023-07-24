import {
  createEffect,
  createMemo,
  createRenderEffect,
  createResource,
  mapArray,
  onCleanup,
  onMount,
  Suspense,
  useTransition,
} from "solid-js";
import { resolveElements } from "@solid-primitives/refs";
import { Component, createSignal, For, Show } from "solid-js";
import { createListTransition, ExitMethod, InterruptMethod } from "../src";

const animationOptions = { duration: 1000, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };

const grayOutOnDispose = (el: HTMLElement) => {
  onCleanup(() => {
    el.style.filter = "grayscale(100%)";
    el.style.zIndex = "0";
  });
};

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function fixPosition(el: HTMLElement) {
  const style = getComputedStyle(el);
  if (style.position !== "absolute" && style.position !== "fixed") {
    const { width, height } = style;
    const startRect = el.getBoundingClientRect();
    el.style.position = "absolute";
    el.style.width = width;
    el.style.height = height;
    addTransform(el, startRect);
  }
}

function unfixPosition(el: HTMLElement) {
  el.style.removeProperty("position");
  el.style.removeProperty("width");
  el.style.removeProperty("height");
  removeTransform(el);
}

function addTransform(el: HTMLElement, startRect: Rect) {
  const endRect = el.getBoundingClientRect();
  if (startRect.x !== endRect.x || startRect.y !== endRect.y) {
    const style = getComputedStyle(el);
    const transform = style.transform === "none" ? "" : style.transform;
    el.style.transform = `${transform} translate(${startRect.x - endRect.x}px, ${
      startRect.y - endRect.y
    }px)`;
  }
}

function removeTransform(el: HTMLElement) {
  el.style.removeProperty("transform");
}

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

  const [exitMethod, setExitMethod] = createSignal<ExitMethod>("move-to-end");
  const [interruptMethod, setInterruptMethod] = createSignal<InterruptMethod>("cancel");

  createEffect(() => {
    console.log(exitMethod(), interruptMethod());
  });

  const Content: Component = () => {
    createRenderEffect(res);

    const node0 = (
      <div
        class="node"
        ref={el => {
          onMount(() => console.log("mounted", el.isConnected));
          grayOutOnDispose(el);
        }}
      >
        ID 0
      </div>
    );

    const resolved = resolveElements(
      () => (
        <>
          <p>Hello</p>
          World
          {show() && node0}
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

    const transition = createMemo(() => {
      return createListTransition(resolved.toArray, {
        appear,
        interruptMethod: interruptMethod(),
        exitMethod: exitMethod(),
      });
    });

    const els = mapArray(
      () => transition()(),
      ([el, { state, useEnter, useExit, useRemain }]) => {
        createEffect(() => {
          console.log("state", state(), el);
        });

        useEnter(() => {
          console.log("enter", el);

          for (const animation of el.getAnimations()) {
            animation.commitStyles();
            animation.cancel();
          }

          const { top: top1, left: left1 } = el.getBoundingClientRect();

          return () => {
            el.removeAttribute("style");
            const { top: top2, left: left2 } = el.getBoundingClientRect();

            return el
              .animate(
                [
                  {
                    opacity: 0,
                    transform: `translate(${left1 - left2}px, ${top1 - top2}px) translateY(-30px)`,
                  },
                  {
                    opacity: 1,
                    transform: `translate(0px, 0px) translateY(0px)`,
                  },
                ],
                animationOptions,
              )
              .finished.catch(() => {});
          };
        });

        useExit(() => {
          console.log("exit", el);

          for (const animation of el.getAnimations()) {
            animation.commitStyles();
            animation.cancel();
          }

          const { top: top1, left: left1 } = el.getBoundingClientRect();

          return () => {
            el.style.position = "absolute";
            el.style.transform = "";
            const { top: top2, left: left2 } = el.getBoundingClientRect();

            return el
              .animate(
                [
                  {
                    transform: `translate(${left1 - left2}px, ${top1 - top2}px) translateY(0px)`,
                  },
                  {
                    opacity: 0,
                    transform: `translate(${left1 - left2}px, ${top1 - top2}px) translateY(30px)`,
                  },
                ],
                animationOptions,
              )
              .finished.catch(() => {});
          };
        });

        useRemain(() => {
          // console.log("remain", el);

          for (const animation of el.getAnimations()) {
            animation.commitStyles();
            animation.cancel();
          }

          const { top: top1, left: left1 } = el.getBoundingClientRect();

          return () => {
            el.style.transform = "";
            const { top: top2, left: left2 } = el.getBoundingClientRect();

            return el
              .animate(
                [
                  { transform: `translate(${left1 - left2}px, ${top1 - top2}px)` },
                  { opacity: 1, transform: `translate(0px, 0px)` },
                ],
                animationOptions,
              )
              .finished.catch(() => {});
          };
        });

        return el;
      },
    );

    return <>{els()}</>;
  };

  return (
    <>
      <div class="flex flex-wrap gap-4">
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
        <label>
          Interrupt method
          <select
            value={interruptMethod()}
            onChange={event => {
              setInterruptMethod(event.currentTarget.value as InterruptMethod);
            }}
          >
            <option value="cancel">Cancel</option>
            <option value="wait">Wait</option>
            <option value="none">None</option>
          </select>
        </label>
        <label>
          Exit method
          <select
            value={exitMethod()}
            onChange={event => {
              setExitMethod(event.currentTarget.value as ExitMethod);
            }}
          >
            <option value="remove">Remove</option>
            <option value="move-to-end">Move to end</option>
            <option value="keep-index">Keep index</option>
          </select>
        </label>
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
            <Content />
          </Show>
        </Suspense>
      </div>
    </>
  );
};

export default ListPage;

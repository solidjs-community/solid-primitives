import { children, ParentComponent } from "solid-js";
import { elements, mapRemoved } from "@solid-primitives/refs";
import { Component, createSignal, For, Show } from "solid-js";
import { createCallbackStack } from "@solid-primitives/utils";

const Keep: ParentComponent<{
  getClear?: (fn: VoidFunction) => void;
}> = props => {
  const resolved = children(() => props.children);
  const refs = elements(resolved, HTMLElement);
  const stack = createCallbackStack();
  props.getClear?.(stack.execute);
  const combined = mapRemoved<HTMLElement | undefined>(refs, (ref, i) => {
    const [el, setEl] = createSignal<HTMLElement | undefined>(ref);
    console.log("REMOVED", i());
    stack.push(() => setEl(undefined));
    ref!.style.filter = "grayscale(100%)";
    ref!.style.position = "relative";
    ref!.appendChild((<div class="absolute bg-black">{i()}</div>) as Element);

    ref!.addEventListener("click", () => setEl(undefined));

    return el;
  });
  return combined;
};

const ListPage: Component = () => {
  const [show, setShow] = createSignal(false);
  const [show1, setShow1] = createSignal(false);
  const [show2, setShow2] = createSignal(true);
  const [showWrapper, setShowWrapper] = createSignal(true);
  const [count, setCount] = createSignal(5);

  let clear!: VoidFunction;

  return (
    <>
      <div class="wrapper-h flex-wrap">
        <button class="btn" onclick={() => setCount(p => ++p)}>
          + 1
        </button>
        <button class="btn" onclick={() => setCount(p => --p)}>
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
        <button class="btn" onclick={() => clear()}>
          clear
        </button>
      </div>
      <div class="wrapper-h flex-wrap">
        <Keep getClear={fn => (clear = fn)}>
          <Show when={showWrapper()}>
            <p>Hello</p>
            World
            {show() && <div class="node">ID 0</div>}
            {/* <Ref<HTMLDivElement>
                ref={el => console.log(el)}
                onMount={el => console.log("Mounted", el)}
              > */}
            <Show when={show1()}>
              <div class="node">ID 1</div>
            </Show>
            {/* </Ref> */}
            <Show when={show2()}>
              <div class="node">ID 2</div>
              <div class="node">ID 3</div>
            </Show>
            <For each={Array.from({ length: count() }, (_, i) => i)}>
              {i => <div class="node bg-yellow-600">{i + 1}.</div>}
            </For>
          </Show>
        </Keep>
      </div>
    </>
  );
};

export default ListPage;

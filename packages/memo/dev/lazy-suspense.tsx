import { createResource, createSignal, Show, Suspense } from "solid-js";
import { createLazyMemo } from "../src/index.js";

export default function App() {
  const [data] = createResource(
    () => new Promise<number>(resolve => setTimeout(() => resolve(4), 1000)),
  );
  const [multiplier, setMultiplier] = createSignal(2);

  const double = createLazyMemo<number>(prev => {
    console.log("CALC", prev);
    return data() ? data()! * multiplier() : 0;
  });

  setInterval(() => setMultiplier(p => ++p), 600);

  const [show1, setShow1] = createSignal(true);
  const [show2, setShow2] = createSignal(false);
  const [show3, setShow3] = createSignal(true);

  return (
    <>
      <button onClick={() => setShow1(p => !p)}>toggle 1</button>
      <button onClick={() => setShow2(p => !p)}>toggle 2</button>
      <button onClick={() => setShow3(p => !p)}>toggle 3</button>
      <Show when={show1()}>
        <Suspense fallback={<p>Loading...</p>}>
          <div>1. Resource: {double()}</div>
        </Suspense>
      </Show>
      <Show when={show2()}>
        <Suspense fallback={<p>Loading...</p>}>
          <div>2. Resource: {double()}</div>
        </Suspense>
      </Show>
      <Show when={show3()}>
        <Suspense fallback={<p>Loading...</p>}>
          <div>3. Resource: {double()}</div>
        </Suspense>
      </Show>
    </>
  );
}

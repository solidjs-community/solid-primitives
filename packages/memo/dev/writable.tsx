import { createEffect, createSignal } from "solid-js";
import { createWritableMemo } from "../src";

export default function Cache() {
  const [source, setSource] = createSignal(1);
  const [memo, setMemo] = createWritableMemo(() => source());

  const [setterCount, setSetterCount] = createSignal(1);
  createEffect(() => {
    setMemo(setterCount());
  });

  return (
    <>
      <p>Signal:</p>
      <button class="btn" onClick={() => setSource(p => ++p)}>
        {source()}
      </button>
      <p>Setter:</p>
      <button class="btn" onClick={() => setSetterCount(p => ++p)}>
        {setterCount()}
      </button>
      <p>Result: {memo()}</p>
    </>
  );
}

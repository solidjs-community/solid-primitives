import { batch, createEffect, createSignal } from "solid-js";
import { createWritableMemo } from "../src";

export default function Cache() {
  const [source, setSource] = createSignal(1);
  const [memo, setMemo] = createWritableMemo(p => (source(), ++p), -2);
  const [memo2, setMemo2] = createWritableMemo(source, -2);

  batch(() => {
    setSource(2);
    console.log(2, source(), memo2());
  });

  batch(() => {
    setMemo2(-3);
    console.log(-3, memo2());
  });

  return (
    <>
      <p>Signal:</p>
      <button class="btn" onClick={() => setSource(p => ++p)}>
        {source()}
      </button>
      <p>Setter:</p>
      <button class="btn" onClick={() => setMemo(p => --p)}>
        {memo()}
      </button>
      <p>Result: {memo()}</p>
    </>
  );
}

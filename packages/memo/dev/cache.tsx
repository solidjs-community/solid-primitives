import { createSignal } from "solid-js";
import { createCache } from "../src";

export default function Cache() {
  const [number, setNumber] = createSignal(1);
  const [divisor, setDivisor] = createSignal(1);
  const [runs, setRuns] = createSignal(0);

  const result = createCache(number, n => {
    setRuns(p => ++p);
    return n / divisor();
  });

  return (
    <>
      <div class="row">
        <p>number = {number()}</p>
        <button class="btn" onClick={() => setNumber(p => ++p)}>
          +1
        </button>
        <button class="btn" onClick={() => setNumber(p => --p)}>
          -1
        </button>
      </div>
      <div class="row">
        <p>divisor = {divisor()}</p>
        <button class="btn" onClick={() => setDivisor(p => ++p)}>
          +1
        </button>
        <button class="btn" onClick={() => setDivisor(p => --p)}>
          -1
        </button>
      </div>
      <p>result = {result()}</p>
      <p>calc ran times = {runs()}</p>
    </>
  );
}

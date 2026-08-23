import { createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface RingBufferStream<T> {
  data: Accessor<readonly T[]>;
  push: (item: T) => boolean;
  clear: () => void;
  available: Accessor<number>;
}

export function createStreamRingBuffer(
  capacity: number = 1024,
  buffer?: SharedArrayBuffer,
): RingBufferStream<number> {
  if (isServer) {
    return {
      data: () => [],
      push: () => false,
      clear: () => {},
      available: () => 0,
    };
  }

  const cap = 1 << (32 - Math.clz32(Math.max(capacity, 2) - 1));
  const mask = cap - 1;

  const byteLength = 8 + cap * 4;
  const sab = buffer || new SharedArrayBuffer(byteLength);
  const headTail = new Int32Array(sab, 0, 2);
  const elements = new Int32Array(sab, 8, cap);

  const [available, setAvailable] = createSignal<number>(0);
  const [data, setData] = createSignal<number[]>([]);

  let running = true;
  const poll = () => {
    if (!running) return;
    const head = Atomics.load(headTail, 0);
    const tail = Atomics.load(headTail, 1);
    const count = (tail - head) & mask;

    if (count > 0) {
      const items: number[] = [];
      let cur = head;
      while (cur !== tail) {
        items.push(elements[cur & mask]!);
        cur = (cur + 1) & mask;
      }
      Atomics.store(headTail, 0, tail);
      setData(items);
      setAvailable(0);
    }
    requestAnimationFrame(poll);
  };
  const rafId = requestAnimationFrame(poll);

  onCleanup(() => {
    running = false;
    cancelAnimationFrame(rafId);
  });

  const push = (val: number): boolean => {
    const head = Atomics.load(headTail, 0);
    const tail = Atomics.load(headTail, 1);
    if (((tail + 1) & mask) === head) {
      return false;
    }
    elements[tail & mask] = val;
    Atomics.store(headTail, 1, (tail + 1) & mask);
    setAvailable(prev => prev + 1);
    return true;
  };

  const clear = () => {
    Atomics.store(headTail, 0, 0);
    Atomics.store(headTail, 1, 0);
    setData([]);
    setAvailable(0);
  };

  return { data, push, clear, available };
}

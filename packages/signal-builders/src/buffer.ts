import { type Accessor, createSignal } from "solid-js";

export type TypedOrPlainArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array
  | any[];

/**
 * Creates a zero-allocation double-buffered signal optimized for high-frequency (e.g. 60-120fps) streams such as WebGL, WebGPU, WebAudio, or canvas render loops.
 *
 * Rather than allocating a new array/buffer on every update, it maintains two pre-allocated buffers (front and back).
 * The `update` function writes directly into the back buffer and then atomically swaps pointers while notifying subscribers via an internal version tick.
 *
 * @param bufferFactory Factory function returning a pre-allocated array or TypedArray buffer.
 * @returns Tuple of [read: Accessor<T>, update: (writer: (back: T) => void) => void, peek: () => T]
 *
 * @example
 * ```ts
 * const [spectrum, updateSpectrum] = createDoubleBuffer(() => new Float32Array(512));
 *
 * // In animation frame loop - Zero GC allocation
 * updateSpectrum((backBuffer) => {
 *   analyser.getFloatFrequencyData(backBuffer);
 * });
 * ```
 */
export function createDoubleBuffer<T extends TypedOrPlainArray>(
  bufferFactory: () => T,
): [
  read: Accessor<T>,
  update: (writer: (backBuffer: T) => void) => void,
  peek: () => T,
] {
  let front = bufferFactory();
  let back = bufferFactory();

  const [version, setVersion] = createSignal(0, { equals: false });

  const read: Accessor<T> = () => {
    version();
    return front;
  };

  const peek = (): T => front;

  const update = (writer: (backBuffer: T) => void): void => {
    writer(back);
    // Swap pointers
    const temp = front;
    front = back;
    back = temp;

    setVersion(v => v + 1);
  };

  return [read, update, peek];
}

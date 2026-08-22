import { type Accessor, createSignal } from "solid-js";

export type SupportedBuffer =
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export function createDoubleBuffer<T extends SupportedBuffer>(
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
    const temp = front;
    front = back;
    back = temp;
    setVersion(v => v + 1);
  };

  return [read, update, peek];
}

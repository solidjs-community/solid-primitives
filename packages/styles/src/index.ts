import { createSharedRoot } from "@solid-primitives/rootless";
import { debounce } from "@solid-primitives/scheduled";
import { Accessor, createSignal, onCleanup } from "solid-js";

export const getRemSize = (): number =>
  parseFloat(getComputedStyle(document.documentElement).fontSize);

export function createRemSize(
  options: {
    debounceTimeout?: number | boolean;
    reevaluateOnRead?: boolean;
  } = {}
): [remSize: Accessor<number>, update: VoidFunction] {
  const [remSize, setRemSize] = createSignal(getRemSize());
  let stale = false;
  let toUpdate: number | undefined;
  const forceUpdate = () => setRemSize(getRemSize());
  const triggerUpdate = options.debounceTimeout
    ? debounce(
        () => {
          stale = false;
          if (toUpdate !== undefined) {
            setRemSize(toUpdate);
            toUpdate = undefined;
          } else forceUpdate();
        },
        typeof options.debounceTimeout === "number" ? options.debounceTimeout : 100
      )
    : forceUpdate;
  const handleResize =
    options.reevaluateOnRead && options.debounceTimeout
      ? () => {
          stale = true;
          triggerUpdate();
        }
      : triggerUpdate;
  addEventListener("resize", handleResize, { passive: true });
  onCleanup(() => removeEventListener("resize", handleResize));
  const read =
    options.reevaluateOnRead && options.debounceTimeout
      ? () => {
          if (stale) {
            remSize();
            stale = false;
            return (toUpdate = getRemSize());
          }
          if (toUpdate !== undefined) {
            remSize();
            return toUpdate;
          }
          return remSize();
        }
      : remSize;
  return [read, forceUpdate];
}

export const useRemSize: () => Accessor<number> = /*#__PURE__*/ createSharedRoot(
  () => createRemSize()[0]
);

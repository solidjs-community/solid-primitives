import { Accessor, createComputed, createSignal, on, onCleanup, untrack } from "solid-js";

type State = "initial" | "entering" | "entered" | "exiting" | "exited";

export function createPresence(
  show: Accessor<boolean>,
  options: {
    initialRun?: boolean;
    duration: number | { enter: number; exit: number };
  },
): Accessor<State> {
  const { initialRun = true, duration } = options;
  const enter = typeof duration === "number" ? duration : duration.enter;
  const exit = typeof duration === "number" ? duration : duration.exit;
  const initialVal = untrack(show) ? "entered" : "exited";
  const [state, setState] = createSignal<State>(initialVal);

  let timeoutId: NodeJS.Timeout;
  const handleTransition = () => {
    clearTimeout(timeoutId);
    const visible = show();
    // If component is visible, start with `initial`,
    // then flush next state immediately to kick start transitions.
    setState(visible ? "initial" : "exiting");
    setTimeout(() => state() === "initial" && setState("entering"), 0);
    timeoutId = setTimeout(
      () => setState(state() === "entering" ? "entered" : "exited"),
      visible ? enter : exit,
    );
  };

  // Replay state transitions if the component
  // is visible and initialRun is set to true.
  if (initialRun && initialVal === "entered") {
    handleTransition();
  }

  // Trigger state transition when `show` signal updates.
  createComputed(on(show, handleTransition, { defer: true }));

  // Clear any pending transition.
  onCleanup(() => clearTimeout(timeoutId));

  return state;
}
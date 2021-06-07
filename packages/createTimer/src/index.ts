
import { createEffect, onCleanup } from 'solid-js';

export type TimerHandler = (...args: any[]) => void;
export enum Schedule {
  Timeout,
  Interval, 
};

/**
 * Provides a declarative useInterval primitive. Ported from
 * https://github.com/donavon/use-interval/blob/master/src/index.tsx.
 *
 * @param callback - Function that will be called every `delay` ms
 * @param delay - Number representing the delay in ms
 * @param schedule - Specify the schedule you'd like to use or supply a custom function
 * @return Provides a manual clear/end function.
 * 
 * @example
 * ```ts
 * let [count, setCount] = createSignal(0);
 * createTimer(() => setCount(count() + 1), 500, Schedule.Interval);
 * return <h1>Counting up: {count()}</h1>;
 * ```
 */
const createTimer = (
  callback: (...args: any[]) => void,
  delay: number | null,
  schedule?: Schedule | Function
): Function => {
  let savedCallback: TimerHandler;
  let intervalId: ReturnType<typeof setTimeout>;
  const endInterval = () => clearInterval(intervalId);
  const scheduler =
    typeof schedule === "function"
      ? schedule
      : schedule === Schedule.Interval
      ? setInterval
      : setTimeout;

  // When callback changes, record the saved callbacck
  createEffect(() => (savedCallback = callback));

  // Handles interval setup
  createEffect(() => {
    const handler = (...args: any[]) => savedCallback(...args);
    if (delay !== null) {
      endInterval();
      intervalId = scheduler(handler, delay);
    }
  });
  onCleanup(() => endInterval);

  return endInterval;
};

export default createTimer;

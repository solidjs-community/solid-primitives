export declare type TimerHandler = (...args: any[]) => void;
export declare enum Schedule {
    Timeout = 0,
    Interval = 1
}
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
declare const createTimer: (callback: (...args: any[]) => void, delay: number | null, schedule?: Function | Schedule | undefined) => Function;
export default createTimer;

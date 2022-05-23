/* @refresh reload */
import { Component, createSelector, Index } from "solid-js";
import { createStore } from "solid-js/store";
import { render } from "solid-js/web";
import "uno.css";
import { createPolled } from "@solid-primitives/timer";
import { leading, debounce, throttle } from "../src";

type TimelinesKeys = "source" | "deb" | "ldeb" | "thr" | "lthr";
const LENGTH = 30;
const TRANSITION = 80;
const TIMEOUT = 400;
const headings: Record<TimelinesKeys, string> = {
  source: "Source",
  deb: "Debounce",
  ldeb: "Leading Debounce",
  thr: "Throttle",
  lthr: "Leading Throttle"
};

const getEmptyTieline = () => Array.from({ length: LENGTH }, () => false);
const getEmptyTimelines = (): Record<TimelinesKeys, boolean[]> => ({
  source: getEmptyTieline(),
  deb: getEmptyTieline(),
  ldeb: getEmptyTieline(),
  thr: getEmptyTieline(),
  lthr: getEmptyTieline()
});

const App: Component = () => {
  const [timelines, setTimelines] = createStore(getEmptyTimelines());
  const current = createPolled<number>(
    p => {
      if (++p === LENGTH) reset(), (p = 0);
      return p;
    },
    TRANSITION,
    0
  );
  const isCurrent = createSelector(current);

  function reset() {
    setTimelines(getEmptyTimelines());
  }

  const triggerDeb = debounce(() => setTimelines("deb", current(), true), TIMEOUT);
  const triggerLDeb = leading(debounce, () => setTimelines("ldeb", current(), true), TIMEOUT);
  const triggerThr = throttle(() => setTimelines("thr", current(), true), TIMEOUT);
  const triggerLThr = leading(throttle, () => setTimelines("lthr", current(), true), TIMEOUT);

  function trigger() {
    setTimelines("source", current(), true);
    triggerDeb();
    triggerLDeb();
    triggerThr();
    triggerLThr();
  }

  return (
    <div class="min-h-screen bg-gray-900 text-white overflow-hidden">
      <div class="p-4 pb-0 center-child">
        <button class="btn" onClick={trigger}>
          TRIGGER!
        </button>
      </div>
      <div class="p-4 pt-2 space-y-4">
        {(Object.keys(timelines) as TimelinesKeys[]).map(name => (
          <div>
            <h3>{headings[name]}</h3>
            <div
              class="w-full grid gap-x-1.5"
              style={`grid-template-columns: repeat(${LENGTH}, 1fr`}
            >
              <Index each={timelines[name]}>
                {(state, index) => (
                  <div
                    class={`h-10vh bg-white rounded-sm transition-opacity duration-${TRANSITION}`}
                    style={{
                      opacity: state() ? 1 : isCurrent(index) ? 0.2 : 0.05
                    }}
                  ></div>
                )}
              </Index>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

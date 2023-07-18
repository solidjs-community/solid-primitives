import { createEventListener } from "@solid-primitives/event-listener";
import { createPolled } from "@solid-primitives/timer";
import { Component, createSelector, Index, untrack } from "solid-js";
import { createStore } from "solid-js/store";
import { debounce, leading, leadingAndTrailing, throttle } from "../src";

type TimelinesKeys = "source" | `${"l" | "lt" | ""}${"deb" | "thr"}`;
const LENGTH = 30;
const TRANSITION = 80;
const TIMEOUT = 400;
const headings: Record<TimelinesKeys, string> = {
  source: "Source",
  deb: "Debounce",
  thr: "Throttle",
  ldeb: "Leading Debounce",
  lthr: "Leading Throttle",
  ltdeb: "Leading and Trailing Debounce",
  ltthr: "Leading and Trailing Throttle",
};

const timelineKeys = Object.keys(headings) as TimelinesKeys[];

const getEmptyTieline = () => Array.from({ length: LENGTH }, () => false);
const getEmptyTimelines = (): Record<TimelinesKeys, boolean[]> => ({
  source: getEmptyTieline(),
  deb: getEmptyTieline(),
  ldeb: getEmptyTieline(),
  ltdeb: getEmptyTieline(),
  thr: getEmptyTieline(),
  lthr: getEmptyTieline(),
  ltthr: getEmptyTieline(),
});

const Timeline: Component = () => {
  const [timelines, setTimelines] = createStore(getEmptyTimelines());
  const current = createPolled<number>(
    p => {
      if (++p === LENGTH) {
        reset();
        p = 0;
      }
      return p;
    },
    TRANSITION,
    0,
  );
  const isCurrent = createSelector(current);

  function reset() {
    setTimelines(getEmptyTimelines());
  }

  const triggers: VoidFunction[] = [
    debounce(() => setTimelines("deb", current(), true), TIMEOUT),
    leading(debounce, () => setTimelines("ldeb", current(), true), TIMEOUT),
    leadingAndTrailing(debounce, () => setTimelines("ltdeb", current(), true), TIMEOUT),
    throttle(() => setTimelines("thr", current(), true), TIMEOUT),
    leading(throttle, () => setTimelines("lthr", current(), true), TIMEOUT),
    leadingAndTrailing(throttle, () => setTimelines("ltthr", current(), true), TIMEOUT),
  ];

  function trigger() {
    setTimelines("source", current(), true);
    for (const cb of triggers) cb();
  }

  createEventListener(
    () => window,
    "keydown",
    e => {
      if (e.key === " ") {
        e.preventDefault();
        trigger();
      }
    },
  );

  return (
    <>
      <div class="center-child p-4 pb-0">
        <button class="btn" onClick={trigger}>
          TRIGGER! (space)
        </button>
      </div>
      <div class="space-y-4 p-4 pt-2">
        {untrack(() =>
          timelineKeys.map(name => (
            <div>
              <h3>{headings[name]}</h3>
              <div
                class="grid w-full gap-x-1.5"
                style={`grid-template-columns: repeat(${LENGTH}, 1fr`}
              >
                <Index each={timelines[name]}>
                  {(state, index) => (
                    <div
                      class={`h-[10vh] rounded-sm bg-white transition-opacity duration-${TRANSITION}`}
                      style={{
                        opacity: state() ? 1 : isCurrent(index) ? 0.2 : 0.05,
                      }}
                    ></div>
                  )}
                </Index>
              </div>
            </div>
          )),
        )}
      </div>
    </>
  );
};

export default Timeline;

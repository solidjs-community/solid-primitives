import { noop } from "@solid-primitives/utils";
import * as API from ".";

export const createTrigger: typeof API.createTrigger = () => [noop, noop];

export const createTriggerCache: typeof API.createTriggerCache = () => ({
  dirty: noop,
  dirtyAll: noop,
  track: noop
});

export const createWeakTriggerCache: typeof API.createWeakTriggerCache = () => ({
  dirty: noop,
  track: noop
});

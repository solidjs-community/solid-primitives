import { noop } from "@solid-primitives/utils";
import * as API from ".";

const createRAF: typeof API.createRAF = () => {
  return [() => false, noop, noop];
};
const targetFPS: typeof API.targetFPS = cb => cb;

export { createRAF, createRAF as default, targetFPS };

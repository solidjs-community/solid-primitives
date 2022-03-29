import { noop } from "@solid-primitives/utils";
import * as API from ".";

const createRAF: typeof API.createRAF = () => {
  return [() => false, noop, noop];
};

export { createRAF, createRAF as default };

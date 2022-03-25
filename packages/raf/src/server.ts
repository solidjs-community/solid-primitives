import { noop } from "@solid-primitives/utils";
import * as API from ".";

const createRAF: typeof API.default = () => {
  return [() => false, noop, noop];
};

export default createRAF;

// "The real signal builders"

import { createSignal } from "solid-js";
import * as fp from "./fp";

const push =
  <T>(item: T) =>
  (list: readonly T[]): T[] =>
    fp.push(list, item);
const drop =
  (n = 1) =>
  <T>(list: readonly T[]): T[] =>
    fp.drop(list, n);

const [state, setState] = createSignal([1, 2, 3]);

setState(push(4));
setState(drop(1));

import { noop } from "@solid-primitives/utils";
import * as API from "./index";

export const newActiveElementListener: typeof API.newActiveElementListener = () => noop;
export const createActiveElement: typeof API.createActiveElement = () => () => null;
export const newFocusListener: typeof API.newFocusListener = () => noop;
export const createFocusSignal: typeof API.createFocusSignal = () => () => false;
export const focus: typeof API.focus = noop;

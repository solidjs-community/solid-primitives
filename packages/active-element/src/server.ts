import { noop } from "@solid-primitives/utils";
import * as API from "./index";

export const makeActiveElementListener: typeof API.makeActiveElementListener = () => noop;
export const createActiveElement: typeof API.createActiveElement = () => () => null;
export const makeFocusListener: typeof API.makeFocusListener = () => noop;
export const createFocusSignal: typeof API.createFocusSignal = () => () => false;
export const focus: typeof API.focus = noop;

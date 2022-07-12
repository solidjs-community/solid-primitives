import { noop } from "@solid-primitives/utils";
import type * as API from "./index";

export const useKeyDownList: typeof API.useKeyDownList = () => [() => [], { event: () => null }];

export const useCurrentlyHeldKey: typeof API.useCurrentlyHeldKey = () => () => null;

export const useKeyDownSequence: typeof API.useKeyDownSequence = () => () => [];

export const createKeyHold: typeof API.createKeyHold = () => () => false;

export const createShortcut: typeof API.createShortcut = noop;

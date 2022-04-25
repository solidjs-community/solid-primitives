import { noop } from "@solid-primitives/utils";
import * as API from "./index";

export const makeConnectivityListener: typeof API.makeConnectivityListener = () => noop;
export const createConnectivitySignal: typeof API.createConnectivitySignal = () => () => true;
export const useConnectivitySignal: typeof API.useConnectivitySignal = () => () => true;

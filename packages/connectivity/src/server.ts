import { noop } from "@solid-primitives/utils";
import * as API from "./index";

export const newConnectivityListener: typeof API.newConnectivityListener = () => noop;
export const createConnectivitySignal: typeof API.createConnectivitySignal = () => () => true;

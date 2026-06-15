import {
  createMemo,
  createSignal,
  type FlowComponent,
  type JSX,
  onSettled,
  sharedConfig,
} from "solid-js";
import { isServer } from "@solidjs/web";

// https://github.com/solidjs/solid/pull/1592

export const ClientOnly: FlowComponent = props => {
  if (isServer) return undefined;
  if (sharedConfig.context) {
    const [flag, setFlag] = createSignal(false);
    onSettled(() => setFlag(true));
    return createMemo(() =>
      flag() ? createMemo(() => props.children) : undefined,
    ) as unknown as JSX.Element;
  }
  return createMemo(() => props.children) as unknown as JSX.Element;
};

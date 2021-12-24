import { Accessor } from "solid-js";

export const createScriptLoader = (opts: {
  _src: string | Accessor<string>;
  _type?: string;
  _onload?: () => void;
  _onerror?: () => void;
}): [script: HTMLScriptElement | undefined, remove: () => void] => {
  return [
    undefined,
    () => {
      /*noop*/
    }
  ];
};

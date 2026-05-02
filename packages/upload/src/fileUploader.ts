import { onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import { transformFiles } from "./helpers.js";
import { type FileUploaderDirective } from "./types.js";

/**
 * Ref callback factory for `<input type="file">` elements.
 *
 * If `onError` is provided it is called with the thrown value when `userCallback` rejects;
 * otherwise the rejection propagates as an unhandled promise rejection.
 *
 * Usage: `<input type="file" ref={fileUploader({ userCallback, setFiles, onError })} />`
 */
export const fileUploader = (options: FileUploaderDirective) => {
  if (isServer) return (_el: HTMLInputElement) => {};

  const { userCallback, setFiles, onError } = options;
  let element: HTMLInputElement | undefined;

  const onChange = async (event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    const parsedFiles = transformFiles(target.files);
    setFiles(parsedFiles);
    try {
      await userCallback(parsedFiles);
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        throw err;
      }
    }
  };

  onCleanup(() => element?.removeEventListener("change", onChange));

  return (el: HTMLInputElement) => {
    element = el;
    el.addEventListener("change", onChange);
  };
};

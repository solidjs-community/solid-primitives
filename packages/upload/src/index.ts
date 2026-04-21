import { onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import { transformFiles } from "./helpers.js";
import { type FileUploaderDirective } from "./types.js";

/**
 * Ref callback factory for `<input type="file">` elements.
 *
 * Usage: `<input type="file" ref={fileUploader({ userCallback, setFiles })} />`
 */
export const fileUploader = (options: FileUploaderDirective) => {
  if (isServer) return (_el: HTMLInputElement) => {};

  const { userCallback, setFiles } = options;
  let element: HTMLInputElement | undefined;

  const onChange = async (event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    const parsedFiles = transformFiles(target.files);
    setFiles(parsedFiles);
    try {
      await userCallback(parsedFiles);
    } catch (error) {
      console.error(error);
    }
  };

  onCleanup(() => element?.removeEventListener("change", onChange));

  return (el: HTMLInputElement) => {
    element = el;
    el.addEventListener("change", onChange);
  };
};

export { createFileUploader } from "./createFileUploader.js";
export { createDropzone } from "./createDropzone.js";
export * from "./types.js";

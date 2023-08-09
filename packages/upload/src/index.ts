import { JSX, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { transformFiles } from "./helpers.js";
import { FileUploaderDirective } from "./types.js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      fileUploader: FileUploaderDirective;
    }
  }
}

export const fileUploader = (element: HTMLInputElement, options: () => FileUploaderDirective) => {
  if (isServer) {
    return;
  }
  const { userCallback, setFiles } = options();

  onMount(() => {
    const onChange: JSX.EventHandler<HTMLInputElement, Event> = async event => {
      const parsedFiles = transformFiles(event.currentTarget.files);

      setFiles(parsedFiles);

      try {
        await userCallback(parsedFiles);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
      return;
    };

    onCleanup(() => element.removeEventListener("change", onChange as any));

    element.addEventListener("change", onChange as any);
  });
};

export { createFileUploader } from "./createFileUploader.js";
export { createDropzone } from "./createDropzone.js";
export * from "./types.js";

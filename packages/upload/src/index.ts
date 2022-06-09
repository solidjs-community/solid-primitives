import { JSX, onCleanup, onMount } from "solid-js";
import { transformFiles } from "./helpers";
import { FileUploaderDirective } from "./types";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      fileUploader: FileUploaderDirective;
    }
  }
}

export const fileUploader = (element: HTMLInputElement, options: () => FileUploaderDirective) => {
  const { userCallback, setFiles } = options();

  onMount(() => {
    const onChange: JSX.EventHandler<HTMLInputElement, Event> = async event => {
      const parsedFiles = transformFiles(event.currentTarget.files);

      setFiles(parsedFiles);

      try {
        await userCallback(parsedFiles);
      } catch (error) {
        console.error(error);
      }
      return;
    };

    onCleanup(() => element.removeEventListener("change", onChange as any));

    element.addEventListener("change", onChange as any);
  });
};

export { createFileUploader } from "./createFileUploader";
export { createDropzone } from "./createDropzone";
export * from "./types";

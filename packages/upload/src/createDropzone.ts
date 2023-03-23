import { createSignal, JSX, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { noop } from "@solid-primitives/utils";
import { transformFiles } from "./helpers";
import { UploadFile, Dropzone, DropzoneOptions } from "./types";

/**
 * Primitive to make working with dropzones easier.
 *
 * @returns `setRef`
 * @returns `files`
 * @returns `isDragging`
 * @returns `removeFile`
 * @returns `clearFiles`
 *
 * @example
 * ```ts
 * // run async user callback
 * const { setRef: dropzoneRef1, files: droppedFiles1 } = createDropzone({
 *   onDrop: async files => {
 *     await doStuff(2);
 *     files.forEach(f => console.log(f));
 *   },
 *   onDragStart: files => console.log("drag start")
 *   onDragStart: files => files.forEach(f => console.log(f)),
 *   onDragOver: files => console.log("drag over")
 * });
 * ```
 */
function createDropzone<T extends HTMLElement = HTMLElement>(
  options?: DropzoneOptions,
): Dropzone<T> {
  if (isServer) {
    return {
      setRef: noop,
      files: () => [],
      isDragging: () => false,
      removeFile: noop,
      clearFiles: noop,
    };
  }
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const [isDragging, setIsDragging] = createSignal(false);

  let ref: T | undefined = undefined;

  const setRef = (r: T) => {
    ref = r;
  };

  const onDragStart: JSX.EventHandler<T, DragEvent> = event => {
    setIsDragging(true);
    Promise.resolve(options?.onDragStart?.(transformFiles(event.dataTransfer?.files || null)));
  };
  const onDragEnd: JSX.EventHandler<T, DragEvent> = event => {
    setIsDragging(false);
    Promise.resolve(options?.onDragEnd?.(transformFiles(event.dataTransfer?.files || null)));
  };

  const onDragEnter: JSX.EventHandler<T, DragEvent> = event => {
    Promise.resolve(options?.onDragEnter?.(transformFiles(event.dataTransfer?.files || null)));
  };
  const onDragLeave: JSX.EventHandler<T, DragEvent> = event => {
    Promise.resolve(options?.onDragLeave?.(transformFiles(event.dataTransfer?.files || null)));
  };
  const onDragOver: JSX.EventHandler<T, DragEvent> = event => {
    event.preventDefault();
    Promise.resolve(options?.onDragOver?.(transformFiles(event.dataTransfer?.files || null)));
  };
  const onDrag: JSX.EventHandler<T, DragEvent> = event => {
    Promise.resolve(options?.onDrag?.(transformFiles(event.dataTransfer?.files || null)));
  };

  const onDrop: JSX.EventHandler<T, DragEvent> = event => {
    event.preventDefault();

    const parsedFiles = transformFiles(event.dataTransfer?.files || null);
    setFiles(parsedFiles);

    Promise.resolve(options?.onDrop?.(parsedFiles));
  };

  onMount(() => {
    if (!ref) return;

    // TODO: Should event.stopPropagation() or event.preventDefault() in handlers below?
    ref.addEventListener("dragstart", onDragStart as any);
    ref.addEventListener("dragenter", onDragEnter as any);
    ref.addEventListener("dragend", onDragEnd as any);
    ref.addEventListener("dragleave", onDragLeave as any);
    ref.addEventListener("dragover", onDragOver as any);
    ref.addEventListener("drag", onDrag as any);
    ref.addEventListener("drop", onDrop as any);

    onCleanup(() => {
      ref?.removeEventListener("dragstart", onDragStart as any);
      ref?.removeEventListener("dragenter", onDragEnter as any);
      ref?.removeEventListener("dragend", onDragEnd as any);
      ref?.removeEventListener("dragleave", onDragLeave as any);
      ref?.removeEventListener("dragover", onDragOver as any);
      ref?.removeEventListener("drag", onDrag as any);
      ref?.removeEventListener("drop", onDrop as any);
    });
  });

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return {
    setRef,
    files,
    isDragging,
    removeFile,
    clearFiles,
  };
}

export { createDropzone };

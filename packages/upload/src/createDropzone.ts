import { createSignal, flush } from "solid-js";
import { isServer } from "@solidjs/web";
import { createEventListenerMap } from "@solid-primitives/event-listener";
import { transformFiles } from "./helpers.js";
import type { UploadFile, Dropzone, DropzoneOptions } from "./types.js";

/**
 * Primitive to make working with dropzones easier.
 *
 * @returns `ref`
 * @returns `files`
 * @returns `error` - Reactive error from the last drag callback, cleared on next drop
 * @returns `isLoading` - True while the `onDrop` callback is pending
 * @returns `isDragging`
 * @returns `removeFile`
 * @returns `clearFiles`
 *
 * @example
 * ```ts
 * const { ref: dropzoneRef, files: droppedFiles, error } = createDropzone({
 *   onDrop: async files => {
 *     await doStuff(2);
 *     files.forEach(f => console.log(f));
 *   },
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
      ref: () => {},
      files: () => [],
      error: () => null,
      isLoading: () => false,
      isDragging: () => false,
      removeFile: () => {},
      clearFiles: () => {},
    };
  }
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const [error, setError] = createSignal<unknown>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);

  const runCallback = async (
    callback: ((files: UploadFile[]) => void | Promise<void>) | undefined,
    parsedFiles: UploadFile[],
  ) => {
    try {
      await callback?.(parsedFiles);
    } catch (err) {
      setError(err);
    }
  };

  const onDragStart = (event: DragEvent) => {
    void runCallback(options?.onDragStart, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragEnd = (event: DragEvent) => {
    void runCallback(options?.onDragEnd, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragEnter = (event: DragEvent) => {
    setIsDragging(true);
    void runCallback(options?.onDragEnter, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragLeave = (event: DragEvent) => {
    setIsDragging(false);
    void runCallback(options?.onDragLeave, transformFiles(event.dataTransfer?.files || null));
  };
  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    void runCallback(options?.onDragOver, transformFiles(event.dataTransfer?.files || null));
  };
  const onDrag = (event: DragEvent) => {
    void runCallback(options?.onDrag, transformFiles(event.dataTransfer?.files || null));
  };
  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const parsedFiles = transformFiles(event.dataTransfer?.files || null);
    setFiles(parsedFiles);
    setError(null);
    setIsLoading(true);
    void (async () => {
      try {
        await options?.onDrop?.(parsedFiles);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const [refTarget, setRefTarget] = createSignal<T | undefined>(undefined);

  createEventListenerMap(refTarget as () => T, {
    dragstart: onDragStart,
    dragenter: onDragEnter,
    dragend: onDragEnd,
    dragleave: onDragLeave,
    dragover: onDragOver,
    drag: onDrag,
    drop: onDrop,
  });

  const ref = (el: T) => { setRefTarget(() => el); flush(); };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return {
    ref,
    files,
    error,
    isLoading,
    isDragging,
    removeFile,
    clearFiles,
  };
}

/**
 * Ref callback factory for dropzone elements. Returns a single value that is
 * both a ref callback and a reactive state object — use it directly as a `ref`
 * while reading `.files`, `.isDragging`, etc. from the same reference.
 *
 * @example
 * ```tsx
 * const dz = dropzone({ onDrop: handleFiles });
 * <div ref={dz} class={dz.isDragging() ? "dragging" : ""} />
 * ```
 */
function dropzone<T extends HTMLElement = HTMLElement>(options?: DropzoneOptions) {
  const { ref, ...state } = createDropzone<T>(options);
  return Object.assign(ref, state);
}

export { createDropzone, dropzone };

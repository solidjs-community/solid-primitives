import { createStore, createMemo, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import type {
  FileUploader,
  FileUploadEntry,
  SendFunction,
  UploadFile,
  UploadProgress,
  UploadStatus,
} from "./types.js";

/**
 * Primitive for uploading files with per-file and aggregate reactive state.
 *
 * Each file in a batch gets its own request (one `send` call per file, all in parallel).
 * Per-file `progress`, `status`, `error`, and `response` are tracked in a store array
 * for fine-grained reactivity — read `files[i].status` directly in JSX.
 * Aggregate `progress` and `status` are derived memos across all entries.
 *
 * Pass a `SendFunction` to control the transport. Use the exported `fileSender` factory
 * for XHR uploads, or supply your own to use fetch, WebSocket, etc. Keeping them separate
 * allows bundlers to tree-shake `fileSender` when it is not used.
 *
 * @param send - Transport function called once per file (e.g. `fileSender("/api/upload")`)
 *
 * @example
 * ```ts
 * import { createFileUploader, fileSender } from "@solid-primitives/upload";
 *
 * const { upload, files, progress, status } = createFileUploader(fileSender("/api/upload"));
 *
 * // Per-file state in JSX:
 * // <For each={files}>{f => <p>{f.file.name} — {f.progress.percentage}%</p>}</For>
 * ```
 */
function createFileUploader(send: SendFunction): FileUploader {
  if (isServer) {
    return {
      upload: async () => [],
      files: [] as readonly FileUploadEntry[],
      progress: () => ({ loaded: 0, total: 0, percentage: 0 }),
      status: () => "idle",
      abort: () => {},
      removeFile: () => {},
      clearFiles: () => {},
    };
  }

  const [files, setFiles] = createStore<FileUploadEntry[]>([]);
  let controllers: AbortController[] = [];
  // Incremented on each upload() call or removal; lets stale async closures silently abandon their writes.
  let generation = 0;

  const upload = async (uploadFiles: UploadFile[]): Promise<unknown[]> => {
    controllers.forEach(c => c.abort());
    controllers = uploadFiles.map(() => new AbortController());
    const thisGen = ++generation;

    setFiles(() =>
      uploadFiles.map(file => ({
        file,
        progress: { loaded: 0, total: 0, percentage: 0 },
        status: "uploading" as UploadStatus,
        error: null,
        response: null,
      })),
    );

    const settled = await Promise.allSettled(
      uploadFiles.map((uploadFile, i) =>
        new Promise<unknown>(resolve =>
          resolve(
            send(
              uploadFile,
              (p: UploadProgress) => {
                if (generation === thisGen) setFiles(s => { s[i]!.progress = p; });
              },
              controllers[i]!.signal,
            ),
          ),
        ).then(
          result => {
            if (generation === thisGen) {
              setFiles(s => {
                s[i]!.status = "success";
                s[i]!.response = result;
              });
            }
            return result;
          },
          (err: unknown) => {
            if (generation === thisGen) {
              setFiles(s => {
                s[i]!.status =
                  err instanceof DOMException && err.name === "AbortError" ? "aborted" : "error";
                s[i]!.error =
                  err instanceof DOMException && err.name === "AbortError" ? null : err;
              });
            }
            return undefined;
          },
        ),
      ),
    );

    return settled.map(r => (r.status === "fulfilled" ? r.value : undefined));
  };

  const abort = () => controllers.forEach(c => c.abort());

  const removeFile = (fileName: string) => {
    controllers.forEach(c => c.abort());
    controllers = [];
    generation++;
    setFiles(s => {
      const idx = s.findIndex(f => f.file.name === fileName);
      if (idx !== -1) s.splice(idx, 1);
    });
  };

  const clearFiles = () => {
    controllers.forEach(c => c.abort());
    controllers = [];
    generation++;
    setFiles(() => []);
  };

  const progress = createMemo((): UploadProgress => {
    if (files.length === 0) return { loaded: 0, total: 0, percentage: 0 };
    const loaded = files.reduce((sum, f) => sum + f.progress.loaded, 0);
    const total = files.reduce((sum, f) => sum + f.progress.total, 0);
    return {
      loaded,
      total,
      percentage: total === 0 ? 0 : Math.round((loaded / total) * 100),
    };
  });

  const status = createMemo((): UploadStatus => {
    if (files.length === 0) return "idle";
    if (files.some(f => f.status === "uploading")) return "uploading";
    if (files.some(f => f.status === "error")) return "error";
    if (files.some(f => f.status === "aborted")) return "aborted";
    return "success";
  });

  onCleanup(abort);

  return { upload, files, progress, status, abort, removeFile, clearFiles };
}

export { createFileUploader };

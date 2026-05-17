import type { SendFunction } from "./types.js";

export type FileSenderOptions = {
  fieldName?: string;
  headers?: Record<string, string>;
};

/**
 * Creates a `SendFunction` that uploads files via XHR POST with progress events.
 *
 * Pass the result directly to `createFileUpload`:
 * ```ts
 * const { upload, progress } = createFileUpload(fileSender("/api/upload"));
 * const { upload, progress } = createFileUpload(fileSender("/api/upload", { fieldName: "attachment" }));
 * ```
 *
 * @param url - Upload endpoint
 * @param options.fieldName - FormData field name for each file (default: `"file"`)
 * @param options.headers - Additional request headers (do not set `Content-Type`; the browser sets it)
 */
export function fileSender(url: string, options?: FileSenderOptions): SendFunction {
  const { fieldName = "file", headers = {} } = options ?? {};

  return (file, onProgress, signal) =>
    new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append(fieldName, file.file, file.name);

      const xhr = new XMLHttpRequest();

      signal.addEventListener("abort", () => xhr.abort());

      xhr.upload.addEventListener("progress", e => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let parsed: unknown = xhr.responseText;
          try {
            parsed = JSON.parse(xhr.responseText);
          } catch {}
          resolve(parsed);
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
      xhr.addEventListener("abort", () => reject(new DOMException("Upload aborted", "AbortError")));

      xhr.open("POST", url);
      for (const [k, v] of Object.entries(headers)) {
        xhr.setRequestHeader(k, v);
      }
      xhr.send(formData);
    });
}

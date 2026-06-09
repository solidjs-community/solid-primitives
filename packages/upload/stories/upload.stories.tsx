import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createDropzone,
  createFilePicker,
  createFileUploader,
  fileUploader,
} from "../src/index.js";
import type { FileUploadEntry, SendFunction, UploadFile, UploadStatus } from "../src/index.js";
import readme from "../README.md?raw";
import {
  Alert,
  Badge,
  BoolRow,
  Button,
  ButtonRow,
  Container,
  ProgressBar,
  Section,
  StatRow,
} from "../../../.storybook/ui/index.js";
import { colors, font, radii } from "../../../.storybook/ui/tokens.js";

const meta = preview.meta({
  title: "Browser APIs/Upload",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Simulates a ~1.5s upload with incremental progress events
const mockSend: SendFunction = (file, onProgress, signal) =>
  new Promise<void>((resolve, reject) => {
    const total = file.size || 100 * 1024;
    const steps = 25;
    const stepMs = 60;
    let step = 0;
    let cancelled = false;

    signal.addEventListener("abort", () => {
      cancelled = true;
      reject(new DOMException("Upload aborted", "AbortError"));
    });

    const tick = () => {
      if (cancelled) return;
      step++;
      onProgress({
        loaded: Math.round((step / steps) * total),
        total,
        percentage: Math.round((step / steps) * 100),
      });
      if (step < steps) setTimeout(tick, stepMs);
      else resolve();
    };

    setTimeout(tick, stepMs);
  });

const statusVariant = (s: UploadStatus): "success" | "error" | "info" | "default" => {
  if (s === "success") return "success";
  if (s === "error" || s === "aborted") return "error";
  if (s === "uploading") return "info";
  return "default";
};

export const FilePickerStory = meta.story({
  name: "File selection",
  parameters: {
    docs: {
      description: {
        story:
          "`createFilePicker` opens the OS file-picker and exposes `files`, `isLoading`, and `error` as reactive signals. Each new selection replaces the previous list — use `removeFile` to trim one entry or `clearFiles` to reset without re-opening the picker.",
      },
    },
  },
  render: () => {
    const { files, isLoading, error, selectFiles, removeFile, clearFiles } = createFilePicker({
      multiple: true,
    });

    return (
      <Container width={320}>
        <ButtonRow>
          <Button onClick={() => selectFiles()}>Pick files</Button>
          <Show when={files().length > 0}>
            <Button variant="outline" onClick={clearFiles}>
              Clear
            </Button>
          </Show>
        </ButtonRow>
        <BoolRow label="isLoading" value={isLoading()} />
        <Show when={error()}>
          <Alert variant="error">{String(error())}</Alert>
        </Show>
        <Show
          when={files().length > 0}
          fallback={
            <span style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>
              No files selected
            </span>
          }
        >
          <Section title={`Selected (${files().length})`}>
            <For each={files()}>
              {file => (
                <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      "font-size": font.sizeSm,
                      flex: "1",
                      overflow: "hidden",
                      "text-overflow": "ellipsis",
                      "white-space": "nowrap",
                    }}
                  >
                    {file.name}
                  </span>
                  <span
                    style={{
                      "font-size": font.sizeSm,
                      color: colors.muted,
                      "white-space": "nowrap",
                      "font-family": font.mono,
                    }}
                  >
                    {formatSize(file.size)}
                  </span>
                  <button
                    onClick={() => removeFile(file.name)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: colors.mutedFg,
                      padding: "0 0.1rem",
                      "font-size": "1.1rem",
                      "line-height": "1",
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </For>
          </Section>
        </Show>
      </Container>
    );
  },
});

export const UploadProgressStory = meta.story({
  name: "Upload progress tracking",
  parameters: {
    docs: {
      description: {
        story:
          "`createFileUploader` calls your `SendFunction` once per file in parallel, tracking per-file and aggregate state in a reactive store. Pick files, then click Upload to see status badges and the progress bar animate. Click Abort to cancel mid-upload.",
      },
    },
  },
  render: () => {
    const { files: picked, selectFiles } = createFilePicker({ multiple: true });
    const { upload, files: entries, progress, status, abort } = createFileUploader(mockSend);

    return (
      <Container width={360}>
        <ButtonRow>
          <Button onClick={() => selectFiles()}>Pick files</Button>
          <Button
            variant="primary"
            disabled={picked().length === 0 || status() === "uploading"}
            onClick={() => upload(picked())}
          >
            Upload
          </Button>
          <Show when={status() === "uploading"}>
            <Button variant="outline" onClick={abort}>
              Abort
            </Button>
          </Show>
        </ButtonRow>
        <Show when={status() !== "idle"}>
          <ProgressBar
            value={progress().percentage}
            label={`Aggregate: ${progress().percentage}%`}
          />
          <StatRow label="Status" value={status()} />
        </Show>
        <Show when={(entries as FileUploadEntry[]).length > 0}>
          <Section title="Files">
            <For each={entries as FileUploadEntry[]}>
              {entry => (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "0.5rem",
                    "font-size": font.sizeSm,
                  }}
                >
                  <span
                    style={{
                      flex: "1",
                      overflow: "hidden",
                      "text-overflow": "ellipsis",
                      "white-space": "nowrap",
                    }}
                  >
                    {entry.file.name}
                  </span>
                  <span
                    style={{
                      "font-family": font.mono,
                      color: colors.muted,
                      "white-space": "nowrap",
                    }}
                  >
                    {entry.progress.percentage}%
                  </span>
                  <Badge variant={statusVariant(entry.status)}>{entry.status}</Badge>
                </div>
              )}
            </For>
          </Section>
        </Show>
        <Show when={picked().length > 0 && (entries as FileUploadEntry[]).length === 0}>
          <Section title={`Ready (${picked().length})`}>
            <For each={picked()}>
              {file => <StatRow label={file.name} value={formatSize(file.size)} />}
            </For>
          </Section>
        </Show>
      </Container>
    );
  },
});

export const DropzoneStory = meta.story({
  name: "Drag-and-drop zone",
  parameters: {
    docs: {
      description: {
        story:
          "`createDropzone` attaches drag lifecycle handlers to any element via its `ref` callback. `isDragging` turns true while a drag hovers over the zone; `files` updates on drop. Drag a file from your OS onto the box below to try it.",
      },
    },
  },
  render: () => {
    const { ref, files, isDragging, isLoading, clearFiles } = createDropzone();

    return (
      <Container width={320}>
        <div
          ref={ref}
          style={{
            border: `2px dashed ${isDragging() ? colors.primary : colors.border}`,
            background: isDragging() ? "#ede9fe" : colors.surface,
            "border-radius": radii.lg,
            padding: "1.75rem 1rem",
            "text-align": "center",
            "font-size": font.sizeSm,
            color: isDragging() ? colors.primary : colors.muted,
            "user-select": "none",
          }}
        >
          {isDragging() ? "Release to drop" : "Drag files here"}
        </div>
        <BoolRow label="isDragging" value={isDragging()} />
        <BoolRow label="isLoading" value={isLoading()} />
        <Show when={files().length > 0}>
          <Section title={`Dropped (${files().length})`}>
            <For each={files()}>
              {file => <StatRow label={file.name} value={formatSize(file.size)} />}
            </For>
            <Button variant="outline" onClick={clearFiles}>
              Clear
            </Button>
          </Section>
        </Show>
      </Container>
    );
  },
});

export const FileUploaderRefStory = meta.story({
  name: "Input ref wiring",
  parameters: {
    docs: {
      description: {
        story:
          "`fileUploader` returns a ref callback that wires an `<input type=\"file\">` into reactive state. The input can be hidden and triggered programmatically — useful when you need full control over the element's markup and styling.",
      },
    },
  },
  render: () => {
    const [files, setFiles] = createSignal<UploadFile[]>([]);
    const [error, setError] = createSignal<unknown>(null);
    let inputEl!: HTMLInputElement;

    const uploaderRef = fileUploader({
      userCallback: () => {},
      setFiles,
      onError: setError,
    });

    return (
      <Container width={320}>
        <input
          type="file"
          multiple
          ref={el => {
            inputEl = el;
            uploaderRef(el);
          }}
          style={{ display: "none" }}
        />
        <Button onClick={() => inputEl.click()}>Choose files</Button>
        <Show when={error()}>
          <Alert variant="error">{String(error())}</Alert>
        </Show>
        <Show
          when={files().length > 0}
          fallback={
            <span style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>
              No files chosen
            </span>
          }
        >
          <Section title={`Files (${files().length})`}>
            <For each={files()}>
              {file => <StatRow label={file.name} value={formatSize(file.size)} />}
            </For>
          </Section>
        </Show>
      </Container>
    );
  },
});

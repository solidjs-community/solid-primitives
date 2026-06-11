import { createMemo, createRoot, createSignal, For, onCleanup, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createFileSystem } from "../src/reactive.js";
import { makeVirtualFileSystem } from "../src/adapter-vfs.js";
import { makeWebAccessFileSystem } from "../src/adapter-web.js";
import { rsync } from "../src/tools.js";
import type { AsyncFileSystem, SyncFileSystem } from "../src/types.js";
import readme from "../README.md?raw";
import {
  Alert,
  Badge,
  Button,
  ButtonRow,
  Card,
  colors,
  Container,
  font,
  radii,
  StatRow,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Display & Media/FileSystem",
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

// ---------------------------------------------------------------------------
// Shared tree-node component used by multiple stories
// ---------------------------------------------------------------------------

type AnyFs = SyncFileSystem | AsyncFileSystem;

const FsNode = (props: {
  fs: AnyFs;
  name: string;
  parentPath: string;
  onDelete?: (path: string) => void;
  onWrite?: (path: string, data: string) => void;
}) => {
  const fullPath = createMemo(() =>
    props.parentPath === "/" ? `/${props.name}` : `${props.parentPath}/${props.name}`,
  );
  const type = createMemo(() => props.fs.getType(fullPath()));
  const [open, setOpen] = createSignal(false);

  return (
    <div style={{ "padding-left": "1rem" }}>
      <div
        style={{
          display: "flex",
          "align-items": "center",
          gap: "0.35rem",
          padding: "0.15rem 0",
        }}
      >
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            width: "12px",
            "text-align": "left",
            color: type() === "dir" ? colors.primary : colors.border,
            "font-size": "0.65rem",
            "font-family": font.mono,
            "line-height": "1",
          }}
        >
          {type() === "dir"
            ? open()
              ? "▼"
              : "▶"
            : props.onWrite
              ? open()
                ? "▾"
                : "▸"
              : "·"}
        </button>
        <span
          style={{
            "font-family": font.mono,
            "font-size": font.sizeSm,
            color: type() === "dir" ? "#1e293b" : colors.secondaryFg,
            "font-weight": type() === "dir" ? "600" : "400",
            flex: "1",
          }}
        >
          {props.name}
        </span>
        <Show when={props.onDelete}>
          <button
            onClick={() => props.onDelete!(fullPath())}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
              "font-size": "0.65rem",
              padding: "0",
              opacity: "0.65",
              "line-height": "1",
            }}
          >
            ×
          </button>
        </Show>
      </div>
      <Show when={open() && type() === "file" && props.onWrite}>
        <textarea
          value={String(props.fs.readFile(fullPath()) ?? "")}
          onInput={e => props.onWrite!(fullPath(), e.currentTarget.value)}
          style={{
            display: "block",
            "margin-left": "1rem",
            width: "calc(100% - 1.25rem)",
            height: "52px",
            "font-family": font.mono,
            "font-size": "0.75rem",
            padding: "0.3rem 0.4rem",
            border: `1px solid ${colors.border}`,
            "border-radius": radii.sm,
            resize: "vertical",
            "box-sizing": "border-box",
          }}
        />
      </Show>
      <Show when={open() && type() === "dir"}>
        <For each={props.fs.readdir(fullPath()) ?? []}>
          {name => (
            <FsNode
              fs={props.fs}
              name={name}
              parentPath={fullPath()}
              onDelete={props.onDelete}
              onWrite={props.onWrite}
            />
          )}
        </For>
      </Show>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Story 1 – Virtual file tree
// ---------------------------------------------------------------------------

export const VirtualTree = meta.story({
  name: "Virtual file tree",
  parameters: {
    docs: {
      description: {
        story:
          "`createFileSystem` wraps `makeVirtualFileSystem` in a reactive layer. `readdir`, `readFile`, and `getType` all return signal values — they re-render any component that reads them whenever the FS mutates. Click ▶ to expand a directory, ▸ to open an inline editor for a file. Use the input to create a file or directory at the root.",
      },
    },
  },
  render: () => {
    const adapter = makeVirtualFileSystem({
      src: {
        "index.ts": 'export const greet = (name: string) => `Hello, ${name}!`;\n',
        "types.ts": "export type ID = string;\n",
      },
      "README.md": "# My Project\n",
    });
    const fs = createFileSystem(adapter);

    const [newName, setNewName] = createSignal("");

    const addFile = () => {
      const n = newName().trim();
      if (!n) return;
      fs.writeFile(`/${n}`, "");
      setNewName("");
    };

    const addDir = () => {
      const n = newName().trim();
      if (!n) return;
      fs.mkdir(`/${n}`);
      setNewName("");
    };

    return (
      <Container width={320}>
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            "border-radius": radii.lg,
            padding: "0.6rem 0.4rem",
            "min-height": "80px",
          }}
        >
          <div
            style={{
              "font-size": "0.68rem",
              "font-weight": "700",
              color: colors.muted,
              "text-transform": "uppercase",
              "letter-spacing": "0.06em",
              "padding-left": "1rem",
              "margin-bottom": "0.3rem",
            }}
          >
            /
          </div>
          <For each={fs.readdir("/") ?? []}>
            {name => (
              <FsNode
                fs={fs}
                name={name}
                parentPath="/"
                onDelete={path => fs.rm(path)}
                onWrite={(path, data) => fs.writeFile(path, data)}
              />
            )}
          </For>
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <input
            value={newName()}
            onInput={e => setNewName(e.currentTarget.value)}
            placeholder="name…"
            style={{
              flex: "1",
              padding: "0.35rem 0.5rem",
              "font-size": font.sizeSm,
              border: `1px solid ${colors.border}`,
              "border-radius": radii.md,
              "font-family": font.mono,
              "box-sizing": "border-box",
            }}
          />
          <Button onClick={addFile} disabled={!newName().trim()} variant="outline">
            + file
          </Button>
          <Button onClick={addDir} disabled={!newName().trim()} variant="outline">
            + dir
          </Button>
        </div>
      </Container>
    );
  },
});

// ---------------------------------------------------------------------------
// Story 2 – rsync between filesystems
// ---------------------------------------------------------------------------

export const RsyncCopy = meta.story({
  name: "rsync copy",
  parameters: {
    docs: {
      description: {
        story:
          "`rsync(src, srcPath, dest, destPath)` recursively copies a file tree from any adapter or reactive FS to another. The destination here is a reactive `SyncFileSystem`, so its `readdir` signals update as each file and directory lands — no polling or manual refresh needed.",
      },
    },
  },
  render: () => {
    const srcAdapter = makeVirtualFileSystem({
      "config.json": '{ "name": "demo", "version": "1.0.0" }',
      src: {
        "index.ts": 'console.log("hello world");\n',
        lib: {
          "utils.ts": "export const id = <T>(x: T): T => x;\n",
        },
      },
    });

    const destAdapter = makeVirtualFileSystem({});
    const destFs = createFileSystem(destAdapter);

    const [syncing, setSyncing] = createSignal(false);
    const [synced, setSynced] = createSignal(false);

    const srcFiles = [...srcAdapter.toMap().keys()];

    const handleSync = async () => {
      setSyncing(true);
      setSynced(false);
      await rsync(srcAdapter, "/", destFs, "/");
      setSyncing(false);
      setSynced(true);
    };

    return (
      <Container width={400}>
        <div
          style={{
            display: "grid",
            "grid-template-columns": "1fr auto 1fr",
            gap: "0.75rem",
            "align-items": "start",
          }}
        >
          <div>
            <div
              style={{
                "font-size": "0.68rem",
                "font-weight": "700",
                color: colors.muted,
                "text-transform": "uppercase",
                "letter-spacing": "0.05em",
                "margin-bottom": "0.4rem",
              }}
            >
              Source
            </div>
            <div
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                "border-radius": radii.md,
                padding: "0.5rem 0.6rem",
              }}
            >
              <For each={srcFiles}>
                {path => (
                  <div
                    style={{
                      "font-family": font.mono,
                      "font-size": "0.73rem",
                      color: colors.muted,
                      padding: "0.1rem 0",
                    }}
                  >
                    {path}
                  </div>
                )}
              </For>
            </div>
          </div>

          <div
            style={{
              "padding-top": "1.75rem",
              color: syncing() ? colors.primary : colors.border,
              "font-size": "1.1rem",
              "line-height": "1",
            }}
          >
            →
          </div>

          <div>
            <div
              style={{
                "font-size": "0.68rem",
                "font-weight": "700",
                color: colors.muted,
                "text-transform": "uppercase",
                "letter-spacing": "0.05em",
                "margin-bottom": "0.4rem",
              }}
            >
              Destination
            </div>
            <div
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                "border-radius": radii.md,
                padding: "0.5rem 0.4rem",
                "min-height": "70px",
              }}
            >
              <Show
                when={(destFs.readdir("/") ?? []).length > 0}
                fallback={
                  <span
                    style={{
                      "font-size": font.sizeSm,
                      color: colors.mutedFg,
                      "font-style": "italic",
                      "padding-left": "0.4rem",
                    }}
                  >
                    {syncing() ? "copying…" : "empty"}
                  </span>
                }
              >
                <For each={destFs.readdir("/") ?? []}>
                  {name => <FsNode fs={destFs} name={name} parentPath="/" />}
                </For>
              </Show>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing()}
          variant="primary"
          style={{ width: "100%" }}
        >
          {syncing() ? "Syncing…" : synced() ? "Sync again" : "rsync →"}
        </Button>
        <Show when={synced()}>
          <Badge variant="success">Copy complete — {srcFiles.length} files</Badge>
        </Show>
      </Container>
    );
  },
});

// ---------------------------------------------------------------------------
// Story 3 – localStorage-backed virtual FS
// ---------------------------------------------------------------------------

export const LocalStorageVfs = meta.story({
  name: "localStorage persistence",
  parameters: {
    docs: {
      description: {
        story:
          "Pass any `Storage`-compatible object as the second argument to `makeVirtualFileSystem` and a key as the third. Every mutation is automatically serialised to that storage. On the next mount the VFS hydrates from the stored value, so files survive page reloads — the live JSON panel below shows the serialised state updating in real time.",
      },
    },
  },
  render: () => {
    const STORAGE_KEY = "solid-primitives-fs-story-demo";
    localStorage.removeItem(STORAGE_KEY);

    const adapter = makeVirtualFileSystem(
      { "notes.txt": "Hello from solid-primitives!\n" },
      localStorage,
      STORAGE_KEY,
    );
    const fs = createFileSystem(adapter);

    const [newName, setNewName] = createSignal("");
    const [snapshot, setSnapshot] = createSignal(localStorage.getItem(STORAGE_KEY) ?? "{}");

    const refreshSnapshot = () => setSnapshot(localStorage.getItem(STORAGE_KEY) ?? "{}");

    const addFile = () => {
      const n = newName().trim();
      if (!n) return;
      fs.writeFile(`/${n}`, "new file");
      setNewName("");
      refreshSnapshot();
    };

    const deleteAll = () => {
      (fs.readdir("/") ?? []).forEach(name => fs.rm(`/${name}`));
      refreshSnapshot();
    };

    return (
      <Container width={340}>
        <div
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            "border-radius": radii.lg,
            padding: "0.6rem 0.4rem",
            "min-height": "60px",
          }}
        >
          <div
            style={{
              "font-size": "0.68rem",
              "font-weight": "700",
              color: colors.muted,
              "text-transform": "uppercase",
              "letter-spacing": "0.06em",
              "padding-left": "1rem",
              "margin-bottom": "0.3rem",
            }}
          >
            /
          </div>
          <For each={fs.readdir("/") ?? []}>
            {name => (
              <FsNode
                fs={fs}
                name={name}
                parentPath="/"
                onDelete={path => {
                  fs.rm(path);
                  refreshSnapshot();
                }}
                onWrite={(path, data) => {
                  fs.writeFile(path, data);
                  refreshSnapshot();
                }}
              />
            )}
          </For>
        </div>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          <input
            value={newName()}
            onInput={e => setNewName(e.currentTarget.value)}
            placeholder="filename…"
            style={{
              flex: "1",
              padding: "0.35rem 0.5rem",
              "font-size": font.sizeSm,
              border: `1px solid ${colors.border}`,
              "border-radius": radii.md,
              "font-family": font.mono,
              "box-sizing": "border-box",
            }}
          />
          <Button onClick={addFile} disabled={!newName().trim()} variant="outline">
            + file
          </Button>
          <Button onClick={deleteAll} variant="ghost">
            clear
          </Button>
        </div>

        <Card>
          <div
            style={{
              "font-size": "0.68rem",
              "font-weight": "700",
              color: colors.muted,
              "text-transform": "uppercase",
              "letter-spacing": "0.05em",
              "margin-bottom": "0.3rem",
            }}
          >
            localStorage["{STORAGE_KEY}"]
          </div>
          <pre
            style={{
              margin: 0,
              "font-family": font.mono,
              "font-size": "0.72rem",
              color: colors.secondaryFg,
              "white-space": "pre-wrap",
              "word-break": "break-all",
              "max-height": "100px",
              overflow: "auto",
            }}
          >
            {snapshot()}
          </pre>
        </Card>

        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          These files persist across page reloads. Navigate away and back — the tree restores from
          the stored JSON.
        </p>
      </Container>
    );
  },
});

// ---------------------------------------------------------------------------
// Story 4 – Browser File System Access API
// ---------------------------------------------------------------------------

export const BrowserDirectoryAccess = meta.story({
  name: "Browser directory picker",
  parameters: {
    docs: {
      description: {
        story:
          "`makeWebAccessFileSystem` calls the browser File System Access API (`showDirectoryPicker`) to wrap a real on-disk directory as an async reactive FS. Reads start as `undefined` and update once the underlying `Promise` resolves — the tree populates progressively. **Requires a Chromium-based browser; may not function inside a sandboxed iframe.**",
      },
    },
  },
  render: () => {
    const [currentFs, setCurrentFs] = createSignal<AsyncFileSystem | null>(null);
    const [picking, setPicking] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);

    let disposeFs: (() => void) | null = null;
    onCleanup(() => disposeFs?.());

    const pick = async () => {
      setError(null);
      setPicking(true);
      try {
        const adapter = await makeWebAccessFileSystem({ mode: "read" });
        if (!adapter) {
          setError("File System Access API is not available in this browser.");
          return;
        }
        disposeFs?.();
        createRoot(d => {
          disposeFs = d;
          setCurrentFs(createFileSystem(adapter));
        });
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e.message);
        }
      } finally {
        setPicking(false);
      }
    };

    return (
      <Container width={340}>
        <ButtonRow>
          <Button onClick={pick} disabled={picking()} variant={currentFs() ? "outline" : "primary"}>
            {picking() ? "Waiting for picker…" : currentFs() ? "Pick another directory" : "Pick a directory"}
          </Button>
        </ButtonRow>

        <Show when={error()}>
          <Alert variant="error">{error()}</Alert>
        </Show>

        <Show when={!currentFs() && !error() && !picking()}>
          <Alert variant="info">
            Click the button above to open the browser's directory picker. The tree below will
            populate as directory entries load asynchronously.
          </Alert>
        </Show>

        <Show when={currentFs()}>
          {f => (
            <div
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                "border-radius": radii.lg,
                padding: "0.6rem 0.4rem",
                "max-height": "240px",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  "font-size": "0.68rem",
                  "font-weight": "700",
                  color: colors.muted,
                  "text-transform": "uppercase",
                  "letter-spacing": "0.06em",
                  "padding-left": "1rem",
                  "margin-bottom": "0.3rem",
                }}
              >
                /
              </div>
              <Show
                when={(f().readdir("/") ?? []).length > 0}
                fallback={
                  <span
                    style={{
                      "font-size": font.sizeSm,
                      color: colors.mutedFg,
                      "font-style": "italic",
                      "padding-left": "1rem",
                    }}
                  >
                    loading entries…
                  </span>
                }
              >
                <For each={f().readdir("/") ?? []}>
                  {name => <FsNode fs={f()} name={name} parentPath="/" />}
                </For>
              </Show>
            </div>
          )}
        </Show>

        <StatRow
          label="entries loaded"
          value={currentFs() ? (currentFs()!.readdir("/") ?? []).length : 0}
        />
      </Container>
    );
  },
});

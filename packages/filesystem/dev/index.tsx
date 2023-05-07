import {
  createSignal,
  Show,
  For,
  Component,
  createResource,
  ErrorBoundary,
  createMemo,
} from "solid-js";

import {
  AsyncFileSystem,
  createFileSystem,
  makeVirtualFileSystem,
  makeWebAccessFileSystem,
  SyncFileSystem,
  getItemName,
} from "../src/index";

const FsFile = (props: { fs: SyncFileSystem | AsyncFileSystem; path: string }) => {
  const [open, setOpen] = createSignal(false);
  const content = createMemo(prev => (prev || open() ? props.fs.readFile(props.path) : undefined));
  const setContent = (data: string) => props.fs.writeFile(props.path, data);
  return (
    <div>
      <p>
        <button onClick={() => setOpen(!open())}>{open() ? "-" : "+"}</button>
        {getItemName(props.path)}
      </p>
      <Show when={open()}>
        <textarea value={content()} onInput={ev => setContent(ev.currentTarget.value)} />
      </Show>
    </div>
  );
};

const FsDir = (props: { fs: SyncFileSystem | AsyncFileSystem; path: string }) => {
  const [open, setOpen] = createSignal(props.path === "/");
  const [name, setName] = createSignal("");
  const list = () => open() && props.fs.readdir(props.path);
  return (
    <>
      <div>
        <button onClick={() => setOpen(!open())}>{open() ? "-" : "+"}</button>{" "}
        {getItemName(props.path) || "/"} <input onInput={ev => setName(ev.currentTarget.value)} />
        <Show when={name() !== ""}>
          <button
            onClick={() =>
              props.fs.writeFile(`${props.path === "/" ? "" : props.path}/${name()}`, "")
            }
          >
            New File
          </button>
          <button
            onClick={() => props.fs.mkdir(`${props.path === "/" ? "" : props.path}/${name()}`)}
          >
            New Dir
          </button>
        </Show>
      </div>
      <Show when={list() !== undefined}>
        <ul>
          <For each={list()!}>
            {item => (
              <li>
                <Show
                  when={props.fs.getType(item) === "dir"}
                  fallback={
                    <FsFile
                      fs={props.fs}
                      path={`${props.path === "/" ? "" : props.path}/${item}`}
                    />
                  }
                >
                  <FsDir fs={props.fs} path={item} />
                </Show>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  );
};

const App: Component = () => {
  const ofs = makeVirtualFileSystem(
    {
      src: { "index.ts": "console.log(0);\n" },
    },
    localStorage,
  );
  const vfs = createFileSystem(ofs);
  const [startAfs, setStartAfs] = createSignal(false);
  const [afs] = createResource(startAfs, async () =>
    createFileSystem(makeWebAccessFileSystem({ mode: "readwrite" })),
  );
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <div>
          <ErrorBoundary
            fallback={(err, reset) => (
              <div>
                Error: {err} <button onClick={reset}>reset</button>
              </div>
            )}
          >
            <h4>FileSystem primitive</h4>
            <p>Object virtual file system (localStorage persistence)</p>
            <FsDir fs={vfs} path="/" />
            <Show
              when={!afs.loading && !afs.error && afs()}
              fallback={
                <button disabled={afs.loading} onClick={() => setStartAfs(true)}>
                  Request directory access
                </button>
              }
            >
              <p>Web Filesystem Access file system</p>
              <p>
                <em>Warning!</em> This can overwrite or delete actual files!
              </p>
              <FsDir fs={afs()!} path="/" />
            </Show>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default App;

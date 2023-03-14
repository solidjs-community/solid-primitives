import { createSignal, Show, For, Component, createResource, ErrorBoundary } from "solid-js";
import { render } from "solid-js/web";
import { AsyncFileSystem, createFileSystem, makeVirtualFileSystem, makeWebAccessFileSystem, SyncFileSystem } from "../src/index";
import "uno.css";

const SyncFile = (props: { fs: SyncFileSystem, path: string }) => {
  const content = props.fs.readFile(props.path);
  const setContent = (data: string) => props.fs.writeFile(props.path, data);
  return <details>
    <summary>{props.path.split("/").at(-1)}</summary>
    <textarea value={/*@once*/content()} onInput={(ev) => setContent(ev.currentTarget.value)} />
  </details>
}

const SyncDir = (props: { fs: SyncFileSystem, path: string }) => {
  const [name, setName] = createSignal("");
  const list = props.fs.readdir(props.path);
  return (
    <>
      {props.path.split("/").at(-1) || "/"} <input onInput={(ev) => setName(ev.currentTarget.value)} />
      <Show when={name() !== ""}>
        <button onClick={() => props.fs.writeFile(`${props.path === "/" ? "" : props.path}/${name()}`, "")}>
          New File
        </button>
        <button onClick={() => props.fs.mkdir(`${props.path === "/" ? "" : props.path}/${name()}`)}>
          New Dir
        </button>
      </Show>
      <ul>
        <For each={list()}>
          {(item) => {
            const itemType = props.fs.getType(item);
            return (            
            <li>
              <Show
                when={itemType() === "dir"}
                fallback={<SyncFile fs={props.fs} path={`${props.path === "/" ? "" : props.path}/${item}`} />}
              >
                <SyncDir fs={props.fs} path={item} />
              </Show>
            </li>
            )
          }}
        </For>
      </ul>
    </>
  );
};

const AsyncFile = (props: { path: string, fs: AsyncFileSystem}) => {
  const content = props.fs.readFile(props.path);
  const setContent = (data: string) => props.fs.writeFile(props.path, data);
  return <details>
    <summary>{props.path.split("/").at(-1)} <button onClick={() => props.fs.rm(props.path)}>Delete</button></summary>
    <Show when={!content.loading && !content.error}>
      <textarea value={content()} onInput={(ev) => setContent(ev.currentTarget.value)} />
    </Show>
  </details>
}

const AsyncDir = (props: { path: string, fs: AsyncFileSystem }) => {
  const [name, setName] = createSignal("");
  const list = props.fs.readdir(props.path);
  return (
    <>
      {props.path.split("/").at(-1) || "/"} <input onInput={(ev) => setName(ev.currentTarget.value)} />
      <Show when={name() !== ""}>
        <button onClick={() => props.fs.writeFile(`${props.path === "/" ? "" : props.path}/${name()}`, "")}>
          New File
        </button>
        <button onClick={() => props.fs.mkdir(`${props.path === "/" ? "" : props.path}/${name()}`)}>
          New Dir
        </button>
      </Show>
      <button onClick={() => props.fs.rm(props.path)}>Delete</button>
      <ul>
        <For each={list()}>
          {(item) => {
            const itemType = props.fs.getType(item);
            return (            
            <li data-path={item}>
              <Show
                when={itemType() === "dir"}
                fallback={<AsyncFile fs={props.fs} path={`${props.path === "/" ? "" : props.path}/${item}`} />}
              >
                <AsyncDir fs={props.fs} path={item} />
              </Show>
            </li>
            )
          }}
        </For>
      </ul>
    </>
  );
}

const App: Component = () => {
  const ofs = makeVirtualFileSystem({
    src: { "index.ts": "console.log(0);\n" },
  }, localStorage);
  const vfs = createFileSystem(ofs);
  const [startAfs, setStartAfs] = createSignal(false);
  const [afs] = createResource(startAfs, async () => createFileSystem(makeWebAccessFileSystem({ mode: "readwrite" })))
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <div>
          <ErrorBoundary fallback={(err, reset) => <div>Error: {err} <button onClick={reset}>reset</button></div>}>
            <h4>FileSystem primitive</h4>
            <p>Object virtual file system (localStorage persistence)</p>
            <SyncDir fs={vfs} path="/" />
            <Show when={!afs.loading && !afs.error && afs()} fallback={
              <button disabled={afs.loading} onClick={() => setStartAfs(true)}>
                Request directory access
              </button>
            }>
              <p>Web Filesystem Access file system</p>
              <p><em>Warning!</em> This can overwrite or delete actual files!</p>
              <AsyncDir fs={afs()!} path="/" />
            </Show>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

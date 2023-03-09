import { createSignal, Show, For, Component } from "solid-js";
import { render } from "solid-js/web";
import { createFileSystem, makeObjectFileSystem, SyncFileSystem } from "../src/index";
import "uno.css";

const File = (props: { fs: SyncFileSystem, path: string }) => {
  const content = props.fs.readFile(props.path);
  const setContent = (data: string) => props.fs.writeFile(props.path, data);
  return <details>
    <summary>{props.path.split("/").at(-1)}</summary>
    <textarea value={/*@once*/content()} onInput={(ev) => setContent(ev.currentTarget.value)} />
  </details>
}

const Dir = (props: { fs: SyncFileSystem, path: string }) => {
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
            return (            
            <li data-path={item}>{(console.log(item, props.fs.getType(item)()), "")}
              <Show
                when={props.fs.getType(item)() === "dir"}
                fallback={<File fs={props.fs} path={`${props.path === "/" ? "" : props.path}/${item}`} />}
              >
                <Dir fs={props.fs} path={item} />
              </Show>
            </li>
            )
          }}
        </For>
      </ul>
    </>
  );
};

const App: Component = () => {
  const ofs = makeObjectFileSystem({
    src: { "index.ts": "console.log(0);\n" },
  }, localStorage);
  const fs = createFileSystem(ofs);
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <div>
          <h4>FileSystem primitive</h4>
          <p>Object virtual file system (localStorage persistence)</p>
          <Dir fs={fs} path="/" />
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

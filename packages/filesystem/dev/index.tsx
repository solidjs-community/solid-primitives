import { createSignal, Show, For, Component } from "solid-js";
import { render } from "solid-js/web";
import { FSDir, createFileSystem, createObjectFileSystem } from "../src/index";
import "uno.css";

const Dir = (props: { fs: FSDir; path?: string }) => {
  const [name, setName] = createSignal("")
  return (
    <>
      {props.fs.uri || "/"} <input onInput={(ev) => setName(ev.currentTarget.value)} />
      <Show when={name() !== ""}>
        <button onClick={() => props.fs.mkfile(name())}>
          New File
        </button>
        <button onClick={() => props.fs.mkdir(name())}>
          New Dir
        </button>
      </Show>
      <ul>
        <For each={props.fs.items}>
          {(item) => (            
            <li>{(console.log(item, props.fs[item]?.type), "")}
              <Show when={props.fs[item]?.type === "dir"} fallback={item}>
                <Dir
                  fs={props.fs[item] as FSDir}
                  path={(props.path || "").split("/").concat([item]).join("/")}
                />
              </Show>
            </li>
          )}
        </For>
      </ul>
    </>
  );
};

const App: Component = () => {
  const fs = createFileSystem(createObjectFileSystem({
    src: { "index.ts": "console.log(0);\n" },
  }));
  //window._fs = fs;
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <div>
          <h4>FileSystem primitive</h4>
          <Dir fs={fs} />
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

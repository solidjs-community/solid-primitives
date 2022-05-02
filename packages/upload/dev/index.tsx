import { Component, createEffect, createSignal, For } from "solid-js";
import { render } from "solid-js/web";
import { createFileUploader, fileUploader } from "../src";
import { doStuff } from "../src/helpers";
import "uno.css";
import { UploadFile } from "../src/types";

fileUploader;

const SingleFileUpload: Component = () => {
  const { files, selectFiles } = createFileUploader();
  const { files: filesAsync, selectFiles: selectFilesAsync } = createFileUploader();

  createEffect(() => console.log("files", files()));
  createEffect(() => console.log("filesAsync", filesAsync()));

  return (
    <div>
      <div>
        <h5>Select a single file</h5>
        <button
          onClick={() => {
            selectFiles(([{ source, name, size, file }]) => {
              console.log({ source, name, size, file });
            });
          }}
        >
          Select
        </button>
        <For each={files()}>{file => <p>{file.name}</p>}</For>
      </div>

      <hr />

      <div>
        <h5>Select a single file with async callback</h5>
        <button
          onClick={() => {
            selectFilesAsync(async ([{ source, name, size, file }]) => {
              await doStuff(2);
              console.log("AWAIT", { source, name, size, file });
            });
          }}
        >
          Select
        </button>
        <For each={filesAsync()}>{file => <p>{file.name}</p>}</For>
      </div>
    </div>
  );
};

const MultipleFileUpload: Component = () => {
  const { files, selectFiles } = createFileUploader({
    multiple: true,
    accept: "image/*"
  });

  createEffect(() => console.log("files", files()));

  return (
    <div>
      <div>
        <h5>Select multiple files</h5>
        <button
          onClick={() => {
            selectFiles(files => files.forEach(file => console.log(file)));
          }}
        >
          Select
        </button>
        <For each={files()}>{item => <p>{item.name}</p>}</For>
      </div>

      <hr />

      {/* <div>
        <h5>Select multiple files with event handler</h5>
        <input type="file" multiple onChange={onChange} />
      </div> */}
    </div>
  );
};

const App: Component = () => {
  const [files, setFiles] = createSignal<UploadFile[]>([])

  createEffect(() => console.log('directive files', files()))

  return (
    <div>
      <h5>Upload files using <strong>directive</strong></h5>
      <input
        type="file"
        multiple
        use:fileUploader={{
          userCallback: fs => fs.forEach(f => console.log(f)),
          setFiles
        }}
      />
      <For each={files()}>
        {file => <p>{file.name}</p>}
      </For>

      <br />
      <br />
      <br />

      <SingleFileUpload />

      <br />
      <br />
      <br />

      <MultipleFileUpload />
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

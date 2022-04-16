import { Component, createEffect, For } from "solid-js";
import { render } from "solid-js/web";
import { createFileUploader } from "../src";
import "uno.css";

const wait = (s: number): Promise<void> => {
  return new Promise((res, rej) => setTimeout(res, s * 1000));
};

const App: Component = () => {
  const { files: file, selectFiles: selectFile } = createFileUploader();
  const { files: fileAsync, selectFiles: selectFileAsync } = createFileUploader();
  const { files, selectFiles } = createFileUploader({
    multiple: true,
    accept: "image/*"
  });
  const { files: fileInput, handleFilesInput: handleFileInput } = createFileUploader();
  const { files: filesInput, handleFilesInput } = createFileUploader({ multiple: true });

  createEffect(() => console.log("file", file && file()));
  createEffect(() => console.log("files", files && files()));
  createEffect(() => console.log("fileAsync", fileAsync && fileAsync()));
  createEffect(() => console.log("fileInput", fileInput && fileInput()));
  createEffect(() => console.log("filesInput", filesInput && filesInput()));

  return (
    <div>
      <div>
        <h5>Select a single file</h5>
        <button
          onClick={() => {
            selectFile(({ source, name, size, file }) => {
              console.log({ source, name, size, file });
            });
          }}
        >
          Select
        </button>
        <p>{file()?.name}</p>
      </div>

      <hr />

      <div>
        <h5>Select a single file with async callback</h5>
        <button
          onClick={() => {
            selectFileAsync(async ({ source, name, size, file }) => {
              await wait(2);
              console.log("AWAIT", { source, name, size, file });
            });
          }}
        >
          Select
        </button>
        <p>{fileAsync()?.name}</p>
      </div>

      <hr />

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

      <div>
        <h5>Select or drag'n'drop a single file with input handler</h5>
        <input type="file" onChange={handleFileInput} />
        <p>{fileInput()?.name}</p>
      </div>

      <hr />

      <div>
        <h5>Select or drag'n'drop multiple files with input handler</h5>
        <input type="file" multiple onChange={handleFilesInput} />
        <For each={filesInput()}>{item => <p>{item.name}</p>}</For>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

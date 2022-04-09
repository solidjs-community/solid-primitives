import { Component, createEffect, For } from "solid-js";
import { render } from "solid-js/web";
import { createFileUploader } from "../src";
import "uno.css";

const wait = (s: number): Promise<void> => {
  return new Promise((res, rej) => setTimeout(res, s * 1000));
};

const App: Component = () => {
  const { file, selectFile } = createFileUploader();
  const { file: fileAsync, selectFile: selectFileAsync } = createFileUploader();
  const { files, selectFiles } = createFileUploader({
    multiple: true,
    accept: "image/*"
  });
  const { file: fileInput, handleFileInput } = createFileUploader();
  const { files: filesInput, handleFilesInput } = createFileUploader({ multiple: true });

  createEffect(() => console.log(file()));
  createEffect(() => console.log(files()));

  return (
    <div>
      <div>
        <h5>Upload single file</h5>
        <button
          onClick={() => {
            selectFile(({ source, name, size, file }) => {
              console.log({ source, name, size, file });
            });
          }}
        >
          Select file
        </button>
        <p>{file()?.name}</p>
      </div>

      <div>
        <h5>Upload single file with async cb</h5>
        <button
          onClick={() => {
            selectFileAsync(async ({ source, name, size, file }) => {
              await wait(2);
              console.log({ source, name, size, file });
            });
          }}
        >
          Select file with async cb
        </button>
        <p>{fileAsync()?.name}</p>
      </div>

      <div>
        <h5>Upload multiple files</h5>
        <button
          onClick={() => {
            selectFiles(files => files.forEach(file => console.log(file)));
          }}
        >
          Select file
        </button>
        <For each={files()}>{item => <p>{item.name}</p>}</For>
      </div>

      <div>
        <h5>Upload single file with input handler</h5>
        <input type="file" onChange={handleFileInput} />
        <p>{fileInput()?.name}</p>
      </div>

      <div>
        <h5>Upload multiple files with input handler</h5>
        <input type="file" multiple onChange={handleFilesInput} />
        <For each={filesInput()}>{item => <p>{item.name}</p>}</For>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

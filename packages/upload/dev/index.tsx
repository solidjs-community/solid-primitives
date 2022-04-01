import { Accessor, Component, For } from "solid-js";
import { render } from "solid-js/web";
import createUpload, { UploadFile } from "../src";
import "uno.css";

const App: Component = () => {
  const [files, selectFiles] = createUpload();
  const [file, selectFile] = createUpload();

  return (
    <div>
      <div>
        <h5>Upload single file</h5>
        <button
          onClick={() => {
            selectFile({}, ({ source, name, size, file }: UploadFile) => {
              console.log({ source, name, size, file });
            });
          }}
        >
          Select file
        </button>
        <p>{(file as Accessor<UploadFile>)()?.name}</p>
      </div>

      <div>
        <h5>Upload multiple files</h5>
        <button
          onClick={() => {
            selectFiles({ multiple: true }, (files: UploadFile[]) => {
              console.log(files);
            });
          }}
        >
          Select file
        </button>
        <For each={(files as Accessor<UploadFile[]>)()}>{file => <p>{file.name}</p>}</For>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

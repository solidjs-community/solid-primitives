import { Accessor, Component, For } from "solid-js";
import { render } from "solid-js/web";
import createFileUploader, { UploadFile } from "../src";
import "uno.css";

const App: Component = () => {
  const [file, selectFile] = createFileUploader();
  const [files, selectFiles] = createFileUploader({
    multiple: true,
    accept: "image/*"
  });

  return (
    <div>
      <div>
        <h5>Upload single file</h5>
        <button
          onClick={() => {
            selectFile(({ source, name, size, file }: UploadFile) => {
              console.log({ source, name, size, file });
            });
          }}
        >
          Select file
        </button>
        <p>{file()?.name}</p>
      </div>

      <div>
        <h5>Upload multiple files</h5>
        <button
          onClick={() => {
            selectFiles((files: UploadFile[]) => {
              console.log(files);
            });
          }}
        >
          Select file
        </button>
        <For each={files()}>{item => <p>{item.name}</p>}</For>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

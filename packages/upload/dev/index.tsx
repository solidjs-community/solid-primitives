import { Component, createSignal, For } from "solid-js";

import { createDropzone, createFileUploader, fileUploader } from "../src";
import { doStuff } from "../src/helpers";

import { UploadFile } from "../src/types";

fileUploader;

const SingleFileUpload: Component = () => {
  const { files, selectFiles } = createFileUploader();
  const { files: filesAsync, selectFiles: selectFilesAsync } = createFileUploader();

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

      <div>
        <h5>Select a single file with async callback</h5>
        <button
          onClick={() => {
            selectFilesAsync(async ([{ source, name, size, file }]) => {
              await doStuff(2);
              console.log({ source, name, size, file });
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
    accept: "image/*",
  });

  return (
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
  );
};

const Dropzone: Component = () => {
  const { setRef: dropzoneRef, files: droppedFiles } = createDropzone({
    onDrop: async files => {
      await doStuff(2);
      files.forEach(f => console.log(f));
    },
    onDragOver: files => console.log("over", files.length),
  });

  return (
    <div>
      <h5>
        Upload files using <strong>createDropzone</strong> with `div` and async callback
      </h5>
      <div ref={dropzoneRef} style={{ width: "100px", height: "100px", background: "red" }}>
        Dropzone
      </div>
      <For each={droppedFiles()}>{file => <p>{file.name}</p>}</For>
    </div>
  );
};

const FileUploaderDirective: Component = () => {
  const [files, setFiles] = createSignal<UploadFile[]>([]);

  return (
    <div>
      <h5>
        Upload files using <strong>fileUploader directive</strong>
      </h5>
      <input
        type="file"
        multiple
        use:fileUploader={{
          userCallback: fs => fs.forEach(f => console.log(f)),
          setFiles,
        }}
      />
      <For each={files()}>{file => <p>{file.name}</p>}</For>
    </div>
  );
};

const App: Component = () => {
  return (
    <div>
      <Dropzone />
      <hr />
      <SingleFileUpload />
      <hr />
      <MultipleFileUpload />
      <hr />
      <FileUploaderDirective />
    </div>
  );
};

export default App;

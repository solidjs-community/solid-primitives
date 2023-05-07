import { Component, createEffect, createSignal } from "solid-js";

import { createSelection } from "../src";

const App: Component = () => {
  const [selection, setSelection] = createSelection();
  const [nodeSelector, setNodeSelector] = createSignal("null");
  const [selectionStart, setSelectionStart] = createSignal(-1);
  const [selectionEnd, setSelectionEnd] = createSignal(-1);
  const serializeHTMLNode = (node: Node | null) =>
    node === null
      ? "null"
      : node instanceof Text
      ? `[Text: "${node.data}"]`
      : `<${node.nodeName.toLowerCase()}${Array.from((node as HTMLElement).attributes)
          .map(attr => " " + attr.name + (attr.value === "" ? "" : '="' + attr.value + '"'))
          .join("")}>`;
  createEffect(() => {
    const node: HTMLElement | null = document.querySelector(nodeSelector());
    const start = selectionStart();
    const end = selectionEnd();
    if (start < 0 || start > 4 || end < 0 || end > 4) {
      setSelection([node, NaN, NaN]);
    }
    setSelection([node, start, end]);
  });
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v items-start">
        <h4>Selection</h4>
        <input type="text" value="test" />
        <br />
        <textarea>test</textarea>
        <div contentEditable>
          t<b>e</b>
          <i>s</i>t
        </div>
      </div>
      <div>
        <h5>Selected:</h5>
        <span>
          {serializeHTMLNode(selection()[0])} {selection()[1]}-{selection()[2]}
        </span>
      </div>
      <div>
        <h5>Manipulate selection</h5>
        <select
          onChange={ev => {
            setNodeSelector(ev.currentTarget.value);
          }}
        >
          <option value="null">no element</option>
          <option value="input[type=text]">text input</option>
          <option value="textarea">text area</option>
          <option value="div[contenteditable]">contentEditable div</option>
        </select>{" "}
        <input
          type="number"
          min="-1"
          max="4"
          value="-1"
          oninput={ev => setSelectionStart(ev.currentTarget.valueAsNumber)}
        />
        {"-"}
        <input
          type="number"
          min="-1"
          max="4"
          value="-1"
          oninput={ev => setSelectionEnd(ev.currentTarget.valueAsNumber)}
        />{" "}
      </div>
    </div>
  );
};

export default App;

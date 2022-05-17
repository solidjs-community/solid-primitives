import { Component } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";
import { withAbort } from "../src/modifiers";

import { createFetch } from "../src/fetch";

const App: Component = () => {
  const [text] = createFetch("assets/test.txt");
  const [json] = createFetch<{ text: string }>("assets/test.json");
  const [aborted, { abort }] = createFetch(
    "assets/abort.txt",
    { initialValue: "this is a fallback after abort" },
    [withAbort()]
  );

  abort();

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Loading plain text</h4>
        <p>{text.loading ? "Loading..." : text()}</p>
        <h4>Loading JSON data</h4>
        <p>{json.loading ? "Loading..." : json().text}</p>
        <h4>Aborting a request</h4>
        <p>{aborted.loading ? "Loading..." : aborted()}</p>
        <h4></h4>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

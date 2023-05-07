import { Component } from "solid-js";

import { withAbort } from "../src/modifiers";

import { createFetch } from "../src/fetch";

const App: Component = () => {
  const [text] = createFetch("assets/test.txt");
  const [json] = createFetch<{ text: string }>("assets/test.json");
  const [aborted, { abort }] = createFetch(
    "assets/abort.txt",
    { initialValue: "this is a fallback after abort" },
    [withAbort()],
  );

  abort();

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
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

export default App;

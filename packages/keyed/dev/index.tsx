import { Component } from "solid-js";

import Key from "./key.js";
import Entries from "./entries.js";

const App: Component = () => {
  return (
    <div class="box-border min-h-screen w-full space-y-4 overflow-hidden bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Key</h4>
        <Key />
      </div>
      <div class="wrapper-v">
        <h4>Entries</h4>
        <Entries />
      </div>
    </div>
  );
};
export default App;

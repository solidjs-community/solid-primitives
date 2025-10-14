import { type Component } from "solid-js";

import Key from "./key.js";
import Entries from "./entries.js";
import MapEntries from "./mapEntries.js";
import SetValues from "./setValues.js";

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
      <div class="wrapper-v">
        <h4>MapEntries</h4>
        <MapEntries />
      </div>
      <div class="wrapper-v">
        <h4>SetValues</h4>
        <SetValues />
      </div>
    </div>
  );
};
export default App;

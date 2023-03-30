import { A, Route, Router, Routes } from "@solidjs/router";
import { render } from "solid-js/web";
import ListPage from "./list-page";
import SwitchPage from "./switch-page";

import "uno.css";

render(
  () => (
    <Router>
      <nav class="fixed left-2 top-2 flex space-x-4">
        <A class="text-yellow-400" href="/list">
          /list
        </A>
        <A class="text-yellow-400" href="/switch">
          /switch
        </A>
      </nav>
      <div class="box-border min-h-screen w-full space-y-4 bg-gray-800 p-24 text-white">
        <Routes>
          <Route path="/list" element={<ListPage />} />
          <Route path="/switch" element={<SwitchPage />} />
        </Routes>
      </div>
    </Router>
  ),
  document.getElementById("root")!,
);

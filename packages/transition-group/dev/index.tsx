import { A, Route, Router, Routes } from "@solidjs/router";
import { render } from "solid-js/web";
import ListPage from "./list-page";
import SwitchPage from "./switch-page";

import "uno.css";

render(
  () => (
    <Router>
      <nav class="fixed top-2 left-2 flex space-x-4">
        <A class="text-yellow-400" href="/list">
          /list
        </A>
        <A class="text-yellow-400" href="/switch">
          /switch
        </A>
      </nav>
      <div class="p-24 box-border w-full min-h-screen space-y-4 bg-gray-800 text-white">
        <Routes>
          <Route path="/list" element={<ListPage />} />
          <Route path="/switch" element={<SwitchPage />} />
        </Routes>
      </div>
    </Router>
  ),
  document.getElementById("root")!
);

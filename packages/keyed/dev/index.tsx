import { Component, lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router, Routes, Route, Link } from "solid-app-router";
import "uno.css";

const Key = lazy(() => import("./key"));
const Rerun = lazy(() => import("./rerun"));

const App: Component = () => {
  return (
    <Router>
      <nav class="fixed top-2 left-2 flex space-x-4">
        <a class="text-yellow-400" href="/">
          reload
        </a>
        <Link class="text-yellow-400" href="/key">
          /key
        </Link>
        <Link class="text-yellow-400" href="/rerun">
          /rerun
        </Link>
      </nav>
      <div class="p-24 box-border w-full min-h-screen space-y-4 bg-gray-800 text-white">
        <Routes>
          <Route path="/key" element={<Key />} />
          <Route path="/rerun" element={<Rerun />} />
        </Routes>
      </div>
    </Router>
  );
};
render(() => <App />, document.getElementById("root"));

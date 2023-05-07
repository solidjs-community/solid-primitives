/* @refresh reload */
import { Component } from "solid-js";

import { Router, Routes, Route, A } from "@solidjs/router";

import Timeline from "./timeline";
import Reactive from "./reactive";

const App: Component = () => {
  return (
    <div class="min-h-screen overflow-hidden bg-gray-900 text-white">
      <Router>
        <nav class="fixed left-2 top-2 flex space-x-4">
          <A class="text-yellow-400" href="/">
            Timeline
          </A>
          <A class="text-yellow-400" href="/page-reactive">
            createScheduled
          </A>
        </nav>
        <Routes>
          <Route path="/" element={<Timeline />} />
          <Route path="/page-reactive" element={<Reactive />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;

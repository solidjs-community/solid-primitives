import { Component, createEffect, Match, Switch } from "solid-js";

import { createBreakpoints } from "../src";
import "./style.css";

const breakpoints = {
  sm: "640px",
  lg: "1024px",
  xl: "1280px",
};

const App: Component = () => {
  const matches = createBreakpoints(breakpoints);

  createEffect(() => {
    console.log("sm", matches.sm);
    console.log("lg", matches.lg);
    console.log("xl", matches.xl);
  });

  return (
    <div
      classList={{
        "text-tiny flex flex-column": true,
        "text-small": matches.sm,
        "text-base flex-row": matches.lg,
        "text-huge": matches.xl,
      }}
      style={{
        gap: matches.lg ? "50px" : "10px",
      }}
    >
      <p>
        <Switch>
          <Match when={matches.xl}>Extra Large</Match>
          <Match when={matches.lg}>Large</Match>
          <Match when={matches.sm}>Small</Match>
          <Match when={!matches.sm}>Smallest</Match>
        </Switch>
      </p>
      <p>Other content</p>
    </div>
  );
};

export default App;

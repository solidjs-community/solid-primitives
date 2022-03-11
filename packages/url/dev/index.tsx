import { createLocationURL, ReactiveURL, useLocationState, useLocationURL } from "../src";
import { Component, createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  // const loc = useLocationState();

  const url = useLocationURL();

  setTimeout(() => (url.hash = "XD"), 1000);

  // setInterval(() => {
  //   url.hash += "d";
  // }, 1000);

  // createEffect(() => {
  //   console.log(url.href);
  // });

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Location</h4>
        <p>{url.href}</p>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

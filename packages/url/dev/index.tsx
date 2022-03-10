import { ReactiveURL, useLocationState } from "../src";
import { Component, createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  // const loc = useLocationState();

  const url = new ReactiveURL("http://readme.com");

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
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

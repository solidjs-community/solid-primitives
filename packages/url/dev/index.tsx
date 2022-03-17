import { createLocationSearchParamRecord, useSharedLocationURL } from "../src";
import { Component, createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  // const loc = useLocationState();

  history.replaceState({}, "", location.protocol + "//" + location.host + "?foo=bar&foo=123&x=d");

  // const [params, { navigate }] = createLocationSearchParams();

  // setTimeout(() => {
  //   navigate({
  //     baz: "boom",
  //     ehhh: [1, 2, 3]
  //   });
  // }, 3000);

  // setInterval(() => {
  //   replace("ehhh", p => [...p, +p[p.length - 1] + 1]);
  // }, 1500);

  // const url = useSharedLocationURL();

  // setTimeout(() => {
  //   // url.hash = "XD";
  //   url.searchParams.set("foo", "bar");
  // }, 1000);

  // setInterval(() => {
  //   url.hash += "d";
  // }, 2000);

  // setInterval(() => {
  //   url.href = location.protocol + "//" + location.host;
  // }, 5000);

  // createEffect(() => {
  //   console.log(url.href);
  // });

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Location</h4>
        {/* <p>{JSON.stringify(params)}</p> */}
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

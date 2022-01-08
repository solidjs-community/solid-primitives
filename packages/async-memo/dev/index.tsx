import { createAsyncMemo } from "../src";
import { Component, createRoot, createSignal, Show, createEffect } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const [id, setId] = createSignal(1);

  const memo = createAsyncMemo(async prev => {
    try {
      const res = await fetch(`https://swapi.dev/api/people/${id()}/`);
      const data = await res.json();
      console.log(data.name);
      return data.name || prev;
    } catch (error) {
      return prev;
    }
  });

  return (
    <div class="p-24 box-border w-full min-h-screen space-y-4 bg-gray-800 text-white">
      <p>ID: {id()}</p>
      <button class="btn" onclick={() => setId(p => p + 1)}>
        update id
      </button>
      <h3>{memo() + ""}</h3>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

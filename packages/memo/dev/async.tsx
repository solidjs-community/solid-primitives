import { createAsyncMemo } from "../src/index.js";
import { type Component, createSignal } from "solid-js";

const Async: Component = () => {
  const [id, setId] = createSignal(1);

  const memo = createAsyncMemo(async prev => {
    try {
      const res = await fetch(`https://swapi.dev/api/people/${id()}/`);
      const data: { name: string | undefined } = await res.json();
      return data.name || prev;
    } catch (error) {
      return prev;
    }
  });

  return (
    <>
      <p>ID: {id()}</p>
      <button class="btn" onclick={() => setId(p => p + 1)}>
        update id
      </button>
      <h3>{memo() + ""}</h3>
    </>
  );
};

export default Async;

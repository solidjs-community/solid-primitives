import { Component, Suspense, createSignal, lazy, onMount } from "solid-js";

const Client = lazy(() => import("./client.jsx"));

const App: Component = () => {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  return <Suspense>{mounted() && <Client />}</Suspense>;
};

export default App;

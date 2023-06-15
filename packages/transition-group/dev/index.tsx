import ListPage from "./list-page";
import SwitchPage from "./switch-page";
import { Match, Switch, createSignal } from "solid-js";

function App() {
  const [page, setPage] = createSignal("list" as "list" | "switch");

  return (
    <>
      <nav class="absolute left-2 top-2 flex space-x-4">
        <button class="text-yellow-400" onClick={() => setPage("list")}>
          /list
        </button>
        <button class="text-yellow-400" onClick={() => setPage("switch")}>
          /switch
        </button>
      </nav>
      <div class="box-border min-h-screen w-full space-y-4 bg-gray-800 p-24 text-white">
        <Switch>
          <Match when={page() === "list"}>
            <ListPage />
          </Match>
          <Match when={page() === "switch"}>
            <SwitchPage />
          </Match>
        </Switch>
      </div>
    </>
  );
}

export default App;

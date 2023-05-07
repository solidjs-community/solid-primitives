import { Component, createMemo } from "solid-js";
import { For, render } from "solid-js/web";
import { counterStore } from "./stores/counter-store";
import { getPeople, getWizards } from "./stores/ages-store";
import { CounterControls, BoxesDemo } from "./components";

const App: Component = () => {
  const {
    state,
    getters: { get: count, isNegative, isPositive, isZero },
    actions: { setState },
  } = counterStore;

  const increment = () => setState({ value: count() + 1 });

  const getBoxCount = createMemo(() => (!isPositive() ? 25 : count()), 0);

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v select-none">
        <h4>Ages</h4>
        <ul>
          <For each={getPeople()}>
            {person => (
              <li>
                <span class="hover:text-green-400" onClick={() => person.actions.birthday()}>
                  {person.state.name}
                </span>
                : {person.getters.yearsOld()}{" "}
                {person.getters.isWizard() && <i class="text-green-200"> wizard</i>}
              </li>
            )}
          </For>
        </ul>
        <footer>Wizards: {getWizards().length}</footer>
      </div>
      <div class="wrapper-v">
        <h4>Counter Information {state.value}</h4>
        <ul>
          <li>isZero: {isZero().toString()}</li>
          <li>isNegative: {isNegative().toString()}</li>
          <li>isPositive: {isPositive().toString()}</li>
        </ul>
        <CounterControls />
        <button type="button" class="btn" onClick={increment}>
          {count()}
        </button>
        <BoxesDemo boxes={getBoxCount()} />
      </div>
    </div>
  );
};

export default App;

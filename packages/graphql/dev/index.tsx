import { gql, createGraphQLClient } from "../src";
import { Component, createSignal, Show, For } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const [code, setCode] = createSignal("BR");

  const query = createGraphQLClient("https://countries.trevorblades.com/");
  const [countriesData] = query(
    gql`
      query {
        countries {
          name
          code
        }
      }
    `
  );
  const [countryData] = query(
    gql`
      query data($code: ID!) {
        country(code: $code) {
          name
        }
      }
    `,
    () => ({
      code: code()
    })
  );

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <h3>Get country by code</h3>
      <input value={code()} oninput={e => setCode(e.currentTarget.value.toUpperCase())}></input>
      <Show when={countryData()}>
        {({ country }) => <h4>{country ? country.name : "not found"}</h4>}
      </Show>
      <h3>Countries:</h3>
      <Show when={countriesData()}>
        <ul>
          <For each={countriesData().countries}>
            {({ name, code }: any) => (
              <li>
                {code} - {name}
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));

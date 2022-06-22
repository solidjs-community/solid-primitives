import { gql, createGraphQLClient } from "../src";
import { Component, createSignal, Show, For } from "solid-js";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const [code, setCode] = createSignal("BR");

  const query = createGraphQLClient("https://countries.trevorblades.com/");
  const [countriesData] = query<{ countries: { name: string; code: string }[] }>(
    gql`
      query {
        countries {
          name
          code
        }
      }
    `
  );
  const [countryData] = query<{ country: { name: string } }>(
    gql`
      query data($code: ID!) {
        country(code: $code) {
          name
        }
      }
    `,
    () => ({
      code: code()
    }),
    { country: { name: "loading..." } }
  );

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <h3>Get country by code</h3>
      <input value={code()} oninput={e => setCode(e.currentTarget.value.toUpperCase())}></input>
      <h4>
        <Show when={countryData()?.country?.name} fallback="not found">
          {name => name}
        </Show>
      </h4>
      <h3>Countries:</h3>
      <Show when={countriesData()}>
        <ul>
          <For each={countriesData()!.countries}>
            {country => (
              <li>
                {country.code} - {country.name}
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

import { type Component, createSignal, Show, For, Suspense } from "solid-js";

import { gql, createGraphQLClient, request, multipartRequest } from "../src/index.js";
import { CountryQueryDocument } from "./gqlgen.js";

// This query will be used by `graphql-code-generator` to generate `CountryQueryDocument`.
// Normally it would be defined inside it's own file, but this is just
// a demonstration.
gql`
  query CountryQuery($code: ID!) {
    country(code: $code) {
      name
    }
  }
`;

const App: Component = () => {
  const [code, setCode] = createSignal("BR");

  const query = createGraphQLClient("https://countries.trevorblades.com/", {
    credentials: "same-origin",
  });

  // We can query using a string.
  const [countriesData] = query<{ countries: { name: string; code: string }[] }>(gql`
    query CountriesQuery {
      countries {
        name
        code
      }
    }
  `);

  // And we can query using `TypedDocumentNode` generated by `graphql-code-generator`.
  // This way the types of the return value and variables are inherited automatically.
  const [countryData] = query(
    CountryQueryDocument,
    () => ({
      code: code(),
    }),
    { initialValue: { country: { name: "loading..." } } },
  );

  // Send a simple mutation with the multipart option. This will never work with the
  // countries.trevorblades.com backend, but it is not a problem, we don't expect it
  // to mutate anything.
  //
  // multipartRequest(
  //   "https://countries.trevorblades.com/",
  //   gql`
  //     mutation CountryFlag($code: String!, $image: Upload!) {
  //       flag (code: $code, image: $image)
  //         code
  //         name
  //       }
  //     }
  //   `,
  //   {
  //     credentials: "same-origin",
  //     variables: { code: "BR", image: new Blob(["THIS IS WHERE THE IMAGE DATA SHOULD BE."], { type: 'image/jpg' })}
  //   }
  // );

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <h3>Get country by code</h3>
      <input value={code()} oninput={e => setCode(e.currentTarget.value.toUpperCase())}></input>
      <h4>
        <Suspense fallback="loading country name...">
          <Show when={countryData()?.country?.name} fallback="not found">
            <p>{countryData()!.country!.name}</p>
          </Show>
        </Suspense>
      </h4>
      <h3>Countries:</h3>
      <Suspense fallback="loading countries...">
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
      </Suspense>
    </div>
  );
};

export default App;

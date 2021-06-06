# solid-create-localstorage

Access [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## How to use it

```javascript
import React from "react";
import ReactDOM from "react-dom";
import useLocalStorage from "react-use-localstorage";

import "./styles.css";

function App() {
  const [item, setItem] = useLocalStorage("name", "Initial Value");

  return (
    <div className="App">
      <h1>Set Name to store in Local Storage</h1>
      <div>
        <label>
          Name:{" "}
          <input
            type="text"
            placeholder="Enter your name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

### Note for SSR (server-side rendering)

If you are using Gatsby or other SSR frameworks, such as Next.js, refer to [this workaround](https://github.com/dance2die/react-use-localstorage/issues/24#issuecomment-581479939) by @hencatsmith.

You need to make sure that `window` is available.

```js
const useSsrLocalStorage = (
  key: string,
  initial: string
): [string, React.Dispatch<string>] => {
  return typeof window === "undefined"
    ? [initial, (value: string) => undefined]
    : useLocalStorage(key, initial);
};
```

## Demo

![demo](https://github.com/dance2die/react-use-localstorage/raw/master/react-use-localstorage.gif)

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

First ported commit from react-use-localstorage.

</details>

## Contributors

Ported from the amazing work by at https://github.com/dance2die/react-use-localstorage.

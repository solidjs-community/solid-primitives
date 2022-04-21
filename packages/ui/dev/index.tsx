// eslint-disable-next-line import/no-unresolved
import "uno.css";
import "./index.css";

import { render } from "solid-js/web";

function App() {
  return <div>Hello world!</div>;
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);

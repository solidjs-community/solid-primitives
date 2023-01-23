import { Component, createSignal, For, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { render } from "solid-js/web";
import "uno.css";
import { createOption, makeOption, None, Some } from "../src";

const UserExample: Component = () => {
  const [user, setUser] = createStore({
    role: Some(1),
    submissionValue: None<string>()
  });
  return (
    <>
      <p>Wrote: {user.submissionValue.unwrap_or("Didnt write yet.")}</p>
      <input
        type="text"
        onInput={e => setUser("submissionValue", makeOption((e.target as any).value || null))}
      />
    </>
  );
};

const ErrorsExample: Component = () => {
  const [errors, setErrors] = createOption<string[]>(null);
  return (
    <>
      <button onClick={() => setErrors(Some([...errors().unwrap_or([]), `${Date.now()}`]))}>
        Add Error
      </button>
      <Show when={errors().isSome()} fallback={<p>No Errors.</p>}>
        <For each={errors().unwrap()}>{error => <p>{error}</p>}</For>
      </Show>
    </>
  );
};

const App: Component = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        "font-size": "2rem",
        gap: "32px",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center"
      }}
    >
      <UserExample />
      <ErrorsExample />
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);

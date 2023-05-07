import { sendEmailDefault, sendEmailAlternative } from "./utils";
import { createEventDispatcher } from "../src";
import { Component, createSignal } from "solid-js";

const App: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div class="box-border grid min-h-screen w-full grid-rows-3 justify-center space-y-4 bg-gray-800 p-2 text-white">
      <Counter
        onCleanCounter={() => setCount(0)}
        onValueChange={evt => setCount(count() + (evt?.detail ?? 1))}
        value={count()}
      />
      <EmailForm formTitle="uncontrolled form" />
      <EmailForm
        formTitle="controlled form"
        onSend={evt => {
          evt.preventDefault();
          sendEmailAlternative(evt.detail).then(console.log);
        }}
      />
    </div>
  );
};

const Counter: Component<{
  onCleanCounter: () => void;
  onValueChange: (evt?: CustomEvent<number>) => void;
  value: number;
}> = props => {
  const dispatch = createEventDispatcher(props);
  return (
    <div class="wrapper-v w-3xl">
      <h2 class="text-5xl">{props.value}</h2>
      <div class="flex">
        <button class="btn w-25 text-4xl" onClick={() => dispatch("valueChange")}>
          {" "}
          +{" "}
        </button>
        <button class="btn w-25 text-4xl" onClick={() => dispatch("valueChange", -1)}>
          {" "}
          -{" "}
        </button>
      </div>
      <button class="btn w-xs text-4xl" onClick={() => dispatch("cleanCounter")}>
        Clear
      </button>
    </div>
  );
};

const EmailForm: Component<{
  formTitle: string;
  onSend?: (evt: CustomEvent<FormData>) => void;
}> = props => {
  const dispatch = createEventDispatcher(props);

  const handleSubmit = (evt: SubmitEvent) => {
    evt.preventDefault();
    const data = new FormData(evt.target as HTMLFormElement);

    const dispatched = dispatch("send", data, { cancelable: true });

    if (!dispatched) return;

    sendEmailDefault(data).then(console.log);
  };

  return (
    <form action="POST" onSubmit={handleSubmit} class="wrapper-v w-3xl">
      <h4>{props.formTitle}</h4>
      <input class="input w-full" name="to" type="email" placeholder="test@email.com" />
      <input class="input w-full" name="subject" type="text" placeholder="RE: the answer" />
      <textarea class="input w-full" name="body" placeholder="42" />
      <button class="btn w-xs">Send Email</button>
    </form>
  );
};

export default App;

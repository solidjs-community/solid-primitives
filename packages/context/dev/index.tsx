import { createContextProvider, MultiProvider } from "../src/index.js";
import {
  type Component,
  createContext,
  createSignal,
  type FlowComponent,
  untrack,
  useContext,
} from "solid-js";

const [CounterProvider, useCounter] = createContextProvider((props: { initial: number }) => {
  const [count, setCount] = createSignal(props.initial);
  const increment = () => setCount(count() + 1);

  return {
    count,
    increment,
  };
});

const Counter: Component = () => {
  const { count, increment } = useCounter()!;

  return (
    <button class="btn" onClick={increment}>
      {count()}
    </button>
  );
};

const TestCtx = createContext<{ title: string }>();

const BoundProvider: FlowComponent = props => (
  <TestCtx value={{ title: "foo" }}>{props.children}</TestCtx>
);

const App: Component = () => {
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Counter component</h4>
        <p class="caption">it's the best we've got...</p>
        <CounterProvider initial={1}>
          <Counter />
        </CounterProvider>

        <MultiProvider
          values={[
            [TestCtx, { title: "Hello Context" }],
            [TestCtx, { title: "Hello Provider" }],
            [TestCtx, undefined],
            BoundProvider,
            CounterProvider,
          ]}
        >
          {untrack(() => {
            const ctx = useContext(TestCtx);
            return <>{ctx?.title}</>;
          })}
        </MultiProvider>
      </div>
    </div>
  );
};

export default App;

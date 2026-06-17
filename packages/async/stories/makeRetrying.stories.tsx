import { makeRetrying } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";;
import { createMemo, Loading, Errored } from "solid-js";

const meta = preview.meta({
  title: "Reactivity",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const Retrying = meta.story({
  name: "makeRetrying",
  parameters: {
    docs: {
      description: {
        story:
          "`makeRetrying` wraps a fetcher in order to retry one or more times after a delay."
      }
    }
  },
  render: () => {
    class FaultyService {
      #calls = 0;
      async get(): Promise<string> {
        return this.#calls++ < 2
          ? Promise.reject(new Error('rejected'))
          : Promise.resolve("works")
      }
    } 
    const service1 = new FaultyService();
    const service2 = new FaultyService();
    const result1 = createMemo(makeRetrying(() => service1.get()));
    const result2 = createMemo(() => service2.get());
    
    return <Loading fallback="Loading...">
      <p>This simulates a service that rejects 2 times before resolving.</p>
      <h3>With retrying:</h3>
      <Errored 
        fallback={(err, reset) => <p>Failed: {err?.toString() || "unknown error"} <button type="button" onClick={reset}>Reset</button></p>}
      >
        <p>{result1()}</p>
      </Errored>
      <h3>Without retrying:</h3>
      <Errored 
        fallback={(err, reset) => <p>Failed: {err?.toString() || "unknown error"} <button type="button" onClick={reset}>Reset</button></p>}
      >
        <p>{result2()}</p>
      </Errored>
    </Loading>
  },
});
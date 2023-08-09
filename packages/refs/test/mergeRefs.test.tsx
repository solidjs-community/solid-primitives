import { describe, test, expect } from "vitest";
import { createRoot, onMount } from "solid-js";
import { mergeRefs, RefProps } from "../src/index.js";

describe("mergeRefs", () => {
  test("passes ref to props and local var", () =>
    createRoot(dispose => {
      let local!: HTMLButtonElement;
      let forwared!: HTMLButtonElement;

      const Button = (props: RefProps<HTMLButtonElement>) => {
        return <button ref={mergeRefs(el => (local = el), props.ref)} />;
      };

      <Button ref={forwared} />;

      onMount(() => {
        expect(local).instanceOf(HTMLButtonElement);
        expect(forwared).instanceOf(HTMLButtonElement);
        dispose();
      });
    }));
});

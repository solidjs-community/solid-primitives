import { describe, test, expect } from "vitest";
import { createRoot, onMount } from "solid-js";
import { mergeRefs } from "../src";

interface ButtonProps {
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
}

describe("mergeRefs", () => {
  test("passes ref to props and local var", () =>
    createRoot(dispose => {
      let local!: HTMLButtonElement;
      let forwared!: HTMLButtonElement;

      const Button = (props: ButtonProps) => {
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

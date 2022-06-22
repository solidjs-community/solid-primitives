import { createRoot, onMount } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { mergeRefs } from "../src";

const test = suite("mergeRefs");

interface ButtonProps {
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
}

test("passes ref to props and local var", () =>
  createRoot(dispose => {
    let local!: HTMLButtonElement;
    let forwared!: HTMLButtonElement;

    const Button = (props: ButtonProps) => {
      return <button ref={mergeRefs(el => (local = el), props.ref)} />;
    };

    <Button ref={forwared} />;

    onMount(() => {
      assert.instance(local, HTMLButtonElement);
      assert.instance(forwared, HTMLButtonElement);
      dispose();
    });
  }));

test.run();

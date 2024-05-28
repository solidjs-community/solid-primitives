import { describe, bench, afterAll } from "vitest";
import { onMount, For } from "solid-js";
import { List } from "../src/index.js";
import { render } from "solid-js/web";


describe("benchmark", () => {
  const ITEMS = 1000;
  const renderedFor = new Set();
  const listFor = Array.from({ length: ITEMS }, (_, i) => i);
  const divFor = document.createElement("div");
  document.body.appendChild(divFor);
  let unmountFor = () => {};

  bench('For', () => new Promise((resolve) => {
    const ItemFor = (props: { number: number }) => {
      onMount(() => {
        renderedFor.add(props.number);
        if (renderedFor.size === ITEMS) { resolve(); }
      })
      return (<span>{props.number}</span>);
    };
    unmountFor = render(() => <For each={listFor}>{(item) => <ItemFor number={item} />}</For>, divFor);
  }))

  const renderedList = new Set();
  const listList = Array.from({ length: ITEMS }, (_, i) => i);
  const divList = document.createElement("div");
  document.body.appendChild(divList);
  let unmountList = () => {};

  bench('List', () => new Promise((resolve) => {
    const ItemList = (props: { number: number }) => {
      onMount(() => {
        renderedList.add(props.number);
        if (renderedList.size === ITEMS) { resolve(); }
      });
      return (<span>{props.number}</span>);
    }
    unmountList = render(() => <List each={listList}>{(item) => <ItemList number={item()} />}</List>, divList);
  }));

  afterAll(() => {
    unmountFor();
    unmountList();
  });
});

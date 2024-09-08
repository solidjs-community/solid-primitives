import { Component } from "solid-js";

export const TEST_LIST = new Array(1_000).fill(undefined).map((_, i) => i);

type VirtualListItemProps = {
  item: number;
};

export const VirtualListItem: Component<VirtualListItemProps> = props => (
  <div style={{ height: "100px" }}>{props.item}</div>
);

import type { Component } from "solid-js";
import { VirtualList } from "../src/index.jsx";

const intl = new Intl.NumberFormat();

const items = new Array(100_000).fill(0).map((_, i) => i);

const App: Component = () => {
  return (
    <div class="box-border flex min-h-screen w-full flex-col space-y-4 bg-gray-800 p-24 text-white">
      <VirtualList
        each={items}
        overscanCount={5}
        rootHeight={720}
        rowHeight={24}
        class="bg-white text-black"
      >
        {item => <VirtualListItem item={item} />}
      </VirtualList>
    </div>
  );
};

type VirtualListItemProps = {
  item: number;
};

const VirtualListItem: Component<VirtualListItemProps> = (props: { item: number }) => {
  console.log("ran", props.item);

  return <div>{intl.format(props.item)}</div>;
};

export default App;

import type { Component } from "solid-js";
import { VirtualList } from "../src/index.jsx";

const items = new Array(100_000).fill(0).map((_, i) => i);

const App: Component = () => {
  return (
    <div class="box-border flex min-h-screen w-full flex-col space-y-4 bg-gray-800 p-24 text-white">
      <VirtualList
        items={items}
        overscanCount={5}
        renderRow={item => <VirtualListItem item={item} />}
        rootHeight={720}
        rowHeight={24}
        class="bg-white text-black"
      />
    </div>
  );
};

type VirtualListItemProps = {
  item: number;
};

const VirtualListItem: Component<VirtualListItemProps> = (props: { item: number }) => {
  console.log("ran", props.item);

  return <div>{props.item}</div>;
};

export default App;

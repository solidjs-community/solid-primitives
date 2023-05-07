import { Component, createMemo, createSignal } from "solid-js";

import { createMarker, makeSearchRegex } from "../src";

const LOREM_IPSUM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ligula tortor, mollis congue augue ac, sagittis sodales odio. Duis vulputate feugiat metus. Curabitur in nisl ac felis vestibulum facilisis vitae eu lectus. In justo metus, viverra non leo quis, laoreet finibus lacus. Phasellus consectetur arcu orci, non varius ligula ornare ac. Nulla facilisi. Maecenas dignissim nulla et sodales venenatis. Nunc purus nunc, consequat vitae convallis sit amet, bibendum quis augue. Pellentesque purus turpis, aliquet eget libero ut, imperdiet fermentum lacus. In sit amet finibus nunc, faucibus tincidunt eros. Praesent pretium lobortis turpis, nec rhoncus dui interdum aliquet. Nulla fermentum tellus nec dui fermentum rhoncus. Ut cursus purus ligula, sed tincidunt diam vulputate sit amet. Sed in eleifend eros. 123456789",
  "Duis nunc massa, mollis ac suscipit in, feugiat sed risus. Morbi imperdiet dapibus felis in congue. Fusce commodo, leo et tristique laoreet, ligula sapien tempus arcu, eget molestie lorem nisl at nulla. Proin dictum bibendum est, ut faucibus neque hendrerit sit amet. Nullam gravida elit sit amet placerat tristique. Morbi ipsum elit, suscipit ac rhoncus id, ornare in turpis. Vivamus convallis placerat est, sit amet dignissim risus rhoncus at. Aenean nec erat et lectus lobortis commodo quis ut eros. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer aliquet tempor mauris, eget commodo enim scelerisque eget. Quisque venenatis porta euismod. Vestibulum at consectetur nibh. Mauris eleifend, dui at consequat fermentum, lorem dolor gravida nibh, vel porta tellus ligula ac risus. Donec convallis, nibh a ultricies imperdiet, velit velit aliquam velit, tempus aliquet lectus purus ac risus.",
] as const;

const App: Component = () => {
  const [search, setSearch] = createSignal("");

  const highlight = createMarker(text => <mark>{text()}</mark>);
  const regex = createMemo(() => makeSearchRegex(search()));

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Highlight search</h4>
        <input class="input" placeholder="Search ..." onInput={e => setSearch(e.target.value)} />
      </div>
      <div>
        <p>{highlight(LOREM_IPSUM[0], regex())}</p>
        <br />
        <p>{highlight(LOREM_IPSUM[1], regex())}</p>
      </div>
    </div>
  );
};

export default App;

import { For } from "solid-js";

const NavMenu = () => {
  const list = [
    "Primitives",
    "Philosophy",
    "Contribution Process",
    "Design Maxims",
    "Basic and Compound Primitives",
    "Managing Primitive Complexity"
  ];
  return (
    <>
      <div class="border-b-2 my-1 mx-4 border-slate-200 dark:border-slate-600" />
      <div class="p-4">
        <ul class="flex flex-col text-lg">
          <For each={list}>
            {item => (
              <li>
                <a class="block py-2 font-semibold" href="#">
                  {item}
                </a>
              </li>
            )}
          </For>
        </ul>
      </div>
    </>
  );
};

export default NavMenu;

import { For } from "solid-js";
import { A } from "solid-start";

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
            {item => {
              const href = `#${item.replace(/\s/g, "-").toLowerCase()}`;

              return (
                <li>
                  {/* <a
                    class="block py-2 font-semibold"
                    href={href}
                  >
                    {item}
                  </a> */}
                  <A class="block py-2 font-semibold" href={href}>
                    {item}
                  </A>
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </>
  );
};

export default NavMenu;

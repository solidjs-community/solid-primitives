import { For } from "solid-js";
import { A, useLocation } from "solid-start";
import { scrollIntoView } from "~/utils/scrollIntoView";
import { setHeaderState } from "./Header";

const NavMenu = () => {
  const location = useLocation();
  const list = [
    "Primitives",
    "Contribution Process",
    "Philosophy",
    "Design Maxims",
    "Basic and Compound Primitives",
    "Managing Primitive Complexity"
  ];
  return (
    <div>
      <div class="border-b-2 my-1 mx-4 border-slate-200 dark:border-slate-600" />
      <div class="p-4">
        <ul class="flex flex-col text-lg">
          <For each={list}>
            {item => {
              const hashName = item.replace(/\s/g, "-").toLowerCase();
              const href = `#${hashName}`;

              return (
                <li>
                  <A
                    class="block py-2 font-semibold"
                    href={href}
                    onClick={() => {
                      if (location.hash === href) {
                        const anchor = document.querySelector(`a[href="${href}"]`)!;
                        scrollIntoView(anchor, { offset: 70, behavior: "auto" });
                        setHeaderState("openNavMenu", false);
                      }
                    }}
                  >
                    {item}
                  </A>
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </div>
  );
};

export default NavMenu;

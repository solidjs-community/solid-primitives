import { type RefProps } from "@solid-primitives/refs";
import { type Component, For } from "solid-js";
import { scrollIntoView } from "~/utils.js";
import { A, useLocation } from "@solidjs/router";

const NavMenu: Component<RefProps<HTMLDivElement> & { onClose: () => void }> = props => {
  const location = useLocation();
  const list = [
    "Primitives",
    "Contribution Process",
    "Philosophy",
    "Design Maxims",
    "Basic and Compound Primitives",
    "Managing Primitive Complexity",
  ];
  return (
    <div ref={props.ref}>
      <div class="mx-4 my-1 border-b-2 border-slate-200 dark:border-slate-600" />
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
                        props.onClose();
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

import { isWindows } from "@solid-primitives/platform";
import { type Component, Show } from "solid-js";

const SearchBtn: Component<{ ref: HTMLButtonElement }> = props => {
  return (
    <button
      class="xs:w-[250px] flex items-center rounded-md border-2 border-[#bdd3f2] bg-white px-2 py-2 font-sans text-[#306FC4] hover:bg-[#f4f9ff] hover:text-[#063983] lg:w-[350px] dark:border-[#59728d] dark:bg-[#293742] dark:text-[#c2d5ee] dark:hover:bg-[#394e5d]"
      ref={props.ref}
    >
      <div class="mr-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <div class="xs:block hidden">Quick Search ...</div>
      <div class="ml-auto">
        <Show when={isWindows} fallback={<span>⌘K</span>}>
          <span>
            <span>Ctrl</span> <span>K</span>
          </span>
        </Show>
      </div>
    </button>
  );
};

export default SearchBtn;

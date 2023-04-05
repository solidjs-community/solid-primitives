import { isIOS, isWindows } from "@solid-primitives/platform";
import { FiSearch } from "solid-icons/fi";
import { Component, Show } from "solid-js";
import { focusInputAndKeepVirtualKeyboardOpen } from "~/utils/focusInputAndKeepVirtualKeyboardOpen";
import { getSearchInput } from "./Search";

const SearchBtn: Component<{ ref: HTMLButtonElement }> = props => {
  return (
    <button
      class="xs:w-[250px] flex items-center rounded-md border-2 border-[#bdd3f2] bg-white px-2 py-2 font-sans text-[#306FC4] hover:bg-[#f4f9ff] hover:text-[#063983] dark:border-[#59728d] dark:bg-[#293742] dark:text-[#c2d5ee] dark:hover:bg-[#394e5d] lg:w-[350px]"
      onClick={() => {
        if (isIOS) {
          focusInputAndKeepVirtualKeyboardOpen(getSearchInput);
        }
      }}
      ref={props.ref}
    >
      <div class="mr-2">
        <FiSearch />
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

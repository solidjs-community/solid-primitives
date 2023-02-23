import { isIOS, isSafari, isWindows } from "@solid-primitives/platform";
import { FiSearch } from "solid-icons/fi";
import { Component, onMount, Show } from "solid-js";
import { focusInputAndKeepVirtualKeyboardOpen } from "~/utils/focusInputAndKeepVirtualKeyboardOpen";
import { getSearchInput } from "./Search";

const SearchBtn: Component<{ ref: HTMLButtonElement }> = props => {
  return (
    <button
      class="flex xs:w-[250px] lg:w-[350px] font-sans px-2 py-2 items-center bg-white border-[#d0e4ff87] border-2 rounded-md text-[#306FC4] hover:text-[#063983] hover:bg-[#d0e4ff87] dark:bg-[#293742] dark:text-[#c2d5ee] dark:hover:bg-[#394e5d]"
      onClick={() => {
        if (isIOS) {
          console.log("fireee");
          focusInputAndKeepVirtualKeyboardOpen(getSearchInput);
        }
      }}
      ref={props.ref}
    >
      <div class="mr-2">
        <FiSearch />
      </div>
      <div class="hidden xs:block">Quick Search ...</div>
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

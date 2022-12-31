import { FiSearch } from "solid-icons/fi";
import { Component } from "solid-js";

const SearchBtn: Component<{ ref: HTMLButtonElement }> = props => {
  return (
    <button
      class="flex sm:w-[250px] lg:w-[350px] font-sans px-2 py-2 items-center bg-white border-[#d0e4ff87] border-2 rounded-md text-[#306FC4] hover:text-[#063983] hover:bg-[#d0e4ff87] dark:bg-[#293742] dark:text-[#c2d5ee] dark:hover:bg-[#394e5d]"
      ref={props.ref}
    >
      <div class="mr-2">
        <FiSearch />
      </div>
      <div class="hidden sm:block">Quick Search ...</div>
      <div class="ml-auto">⌘K</div>
    </button>
  );
};

export default SearchBtn;

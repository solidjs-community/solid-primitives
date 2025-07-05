import { type Component } from "solid-js";

const Hamburger: Component<{ ref: HTMLButtonElement; active: boolean }> = props => {
  return (
    <button
      class="bg-page-main-bg mr-[-10px] flex h-[45px] w-[45px] items-center justify-center rounded-lg text-[#306FC4] transition-colors hover:bg-[#f4f9ff] hover:text-[#063983] dark:text-[#c2d5ee] dark:hover:bg-[#3c5364] dark:hover:text-white"
      ref={props.ref}
    >
      <div
        class="flex h-[12px] w-[18px] origin-center flex-col justify-between transition-transform"
        classList={{ "rotate-[225deg]": props.active }}
      >
        <div
          class="h-[2px] w-full rounded-lg bg-current transition-transform"
          classList={{ "translate-y-[5px]": props.active }}
        />
        <div
          class="h-[2px] w-full origin-center rounded-lg bg-current transition-transform"
          classList={{ "rotate-90": props.active }}
        />
        <div
          class="h-[2px] w-full rounded-lg bg-current transition-transform"
          classList={{ "translate-y-[-5px]": props.active }}
        />
      </div>
      {/* <FiMenu size={24} /> */}
    </button>
  );
};

export default Hamburger;

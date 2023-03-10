import { Component } from "solid-js";

const Hamburger: Component<{ ref: HTMLButtonElement; active: boolean }> = props => {
  return (
    <button
      class="w-[45px] h-[45px] flex justify-center items-center text-[#306FC4] hover:text-[#063983] mr-[-10px] dark:text-[#c2d5ee] dark:hover:text-white bg-page-main-bg hover:bg-[#f4f9ff] rounded-lg dark:hover:bg-[#3c5364] transition-colors"
      ref={props.ref}
    >
      <div
        class="flex flex-col justify-between w-[18px] h-[12px] transition-transform origin-center"
        classList={{ "rotate-[225deg]": props.active }}
      >
        <div
          class="w-full h-[2px] bg-current rounded-lg transition-transform"
          classList={{ "translate-y-[5px]": props.active }}
        />
        <div
          class="w-full h-[2px] bg-current rounded-lg transition-transform origin-center"
          classList={{ "rotate-90": props.active }}
        />
        <div
          class="w-full h-[2px] bg-current rounded-lg transition-transform"
          classList={{ "translate-y-[-5px]": props.active }}
        />
      </div>
      {/* <FiMenu size={24} /> */}
    </button>
  );
};

export default Hamburger;

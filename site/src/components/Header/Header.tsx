import solidPrimitivesLogo from "~/assets/img/solid-primitives-logo.svg";
import solidPrimitivesStackedLogo from "~/assets/img/solid-primitives-stacked-logo.svg";
import HalfSun from "../Icons/HalfSun";
import { FiMenu, FiSearch } from "solid-icons/fi";
import { createSignal } from "solid-js";
import SearchModal from "../Search/SearchModal";
import { A } from "@solidjs/router";

const Header = () => {
  let menuButton!: HTMLButtonElement;
  const [open, setOpen] = createSignal(false);
  return (
    <header
      class="fixed top-0 left-0 right-0 h-[60px] backdrop-blur-md bg-white/50 z-10"
      style="z-index: 10"
    >
      <div class="max-w-[900px] mx-auto w-full h-full flex px-4 sm:px-8 items-center justify-between">
        {/* <A href="/"> */}
        <a href="/">
          <img class="hidden sm:block h-[28px] sm:h-[40px]" src={solidPrimitivesLogo} alt="" />
          <img class="sm:hidden h-[28px] sm:h-[40px]" src={solidPrimitivesStackedLogo} alt="" />
        </a>
        {/* </A> */}
        <nav>
          <ul class="flex items-center gap-3">
            <li>
              <button
                class="flex sm:w-[250px] lg:w-[350px] font-sans px-2 py-2 items-center bg-white border-[#d0e4ff87] border-2 rounded-md text-[#306FC4] hover:text-[#063983] hover:bg-[#d0e4ff87]"
                ref={menuButton}
              >
                <div class="mr-2">
                  <FiSearch />
                </div>
                <div class="hidden sm:block">Quick Search ...</div>
                <div class="ml-auto">⌘K</div>
              </button>
            </li>
            <li>
              <button class="w-[45px] h-[45px] flex justify-center items-center text-[#306FC4] bg-[#F8F8FC] hover:text-[#063983] hover:bg-[#d0e4ff87] rounded-full transition-colors">
                {/* <FiGithub size={20} /> */}
                {/* <FaBrandsGithub /> */}
                {/* < */}
                <HalfSun />
              </button>
            </li>
            <li>
              <button class="w-[45px] h-[45px] flex justify-center items-center text-[#306FC4] hover:text-[#063983] mr-[-10px]">
                <FiMenu size={24} />
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <SearchModal menuButton={menuButton} open={open} setOpen={setOpen} />
    </header>
  );
};

export default Header;

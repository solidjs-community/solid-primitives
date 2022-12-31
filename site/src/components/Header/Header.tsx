import solidPrimitivesLogo from "~/assets/img/solid-primitives-logo.svg";
import solidPrimitivesDarkLogo from "~/assets/img/solid-primitives-dark-logo.svg";
import solidPrimitivesStackedLogo from "~/assets/img/solid-primitives-stacked-logo.svg";
import { FiMenu, FiSearch } from "solid-icons/fi";
import { createSignal, onMount } from "solid-js";
import SearchModal from "../Search/SearchModal";
import ThemeBtn from "./ThemeBtn";
import SearchBtn from "../Search/SearchBtn";

const Header = () => {
  const [open, setOpen] = createSignal(false);
  let menuButton!: HTMLButtonElement;
  let headerEl!: HTMLDivElement;

  const showActiveHeader = () => {
    headerEl.classList.add("bg-white/50", "dark:bg-[#293843]/50");
    headerEl.classList.remove("bg-white/0", "dark:bg-[#293843]/0");
    headerEl.classList.add("backdrop-blur-md");
    headerEl.classList.remove("backdrop-blur-none");
  };

  const hideActiveHeader = () => {
    headerEl.classList.remove("bg-white/50", "dark:bg-[#293843]/50");
    headerEl.classList.add("bg-white/0", "dark:bg-[#293843]/0");
    headerEl.classList.remove("backdrop-blur-md");
    headerEl.classList.add("backdrop-blur-none");
  };

  onMount(() => {
    if (window.scrollY > 30) {
      showActiveHeader();
    } else {
      hideActiveHeader();
    }

    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 30) {
          showActiveHeader();
        } else {
          hideActiveHeader();
        }
      },
      { passive: true }
    );
  });

  return (
    <header
      class="fixed top-0 left-0 right-0 h-[60px] bg-white/0 dark:bg-[#293843]/0 z-10 transition-[background-color,backdrop-filter]"
      ref={headerEl}
    >
      <div class="max-w-[900px] mx-auto w-full h-full flex px-4 sm:px-8 items-center justify-between">
        {/* <A href="/"> */}
        <a href="/">
          <img
            class="dark:hidden hidden sm:block h-[28px] sm:h-[40px]"
            src={solidPrimitivesLogo}
            alt=""
          />
          <img
            class="hidden dark:sm:block h-[28px] sm:h-[40px]"
            src={solidPrimitivesDarkLogo}
            alt=""
          />
          <img class="sm:hidden h-[28px] sm:h-[40px]" src={solidPrimitivesStackedLogo} alt="" />
        </a>
        {/* </A> */}
        <nav>
          <ul class="flex items-center gap-3">
            <li>
              <SearchBtn ref={menuButton} />
            </li>
            <li>
              <ThemeBtn />
            </li>
            <li>
              <button class="w-[45px] h-[45px] flex justify-center items-center text-[#306FC4] hover:text-[#063983] mr-[-10px] dark:text-[#c2d5ee] dark:hover:text-white">
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

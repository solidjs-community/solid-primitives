import solidPrimitivesLogo from "~/assets/img/solid-primitives-logo.svg";
import solidPrimitivesDarkLogo from "~/assets/img/solid-primitives-dark-logo.svg";
import solidPrimitivesStackedLogo from "~/assets/img/solid-primitives-stacked-logo.svg";
import solidPrimitivesStackedDarkLogo from "~/assets/img/solid-primitives-stacked-dark-logo.svg";
import { FiMenu, FiSearch } from "solid-icons/fi";
import { createSignal, onMount } from "solid-js";
import SearchModal from "../Search/SearchModal";
import ThemeBtn from "./ThemeBtn";
import SearchBtn from "../Search/SearchBtn";
import { useLocation } from "solid-start";

const Header = () => {
  const [open, setOpen] = createSignal(false);
  const [showOpaqueBg, setShowOpaqueBg] = createSignal(false);
  const [showShadow, setShowShadow] = createSignal(false);
  const location = useLocation();
  let menuButton!: HTMLButtonElement;

  const checkScroll = () => {
    const showOpaqueBg = window.scrollY > 30;
    const showShadow = window.scrollY > 150;

    setShowOpaqueBg(showOpaqueBg);

    if (location.pathname === "/") {
      setShowShadow(false);
      return;
    }
    setShowShadow(showShadow);
  };

  onMount(() => {
    checkScroll();

    window.addEventListener(
      "scroll",
      () => {
        checkScroll();
      },
      { passive: true }
    );
  });

  return (
    <header
      class="fixed top-0 left-0 right-0 h-[60px] z-10 transition-[background-color,backdrop-filter]"
      classList={{
        "backdrop-blur-md bg-white/50 dark:bg-[#293843]/50": showOpaqueBg(),
        "backdrop-blur-none bg-white/0 dark:bg-[#293843]/0": !showOpaqueBg()
      }}
    >
      <div class="relative max-w-[900px] mx-auto w-full h-full flex px-4 sm:px-8 items-center justify-between gap-2">
        <div
          class="absolute top-0 left-0 bottom-0 right-0 box-shadow-[var(--header-box-shadow)] -z-1 transition-opacity"
          classList={{ "opacity-0": !showShadow(), "opacity-100": showShadow() }}
        />
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
          <img
            class="dark:hidden sm:hidden h-[28px] sm:h-[40px]"
            src={solidPrimitivesStackedLogo}
            alt=""
          />
          <img
            class="hidden dark:block sm:!hidden h-[28px] sm:h-[40px]"
            src={solidPrimitivesStackedDarkLogo}
            alt=""
          />
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

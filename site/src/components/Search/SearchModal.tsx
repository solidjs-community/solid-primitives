// import { createShortcut } from "@solid-primitives/keyboard";
import Dismiss from "solid-dismiss";
import { Accessor, Component, createEffect, on } from "solid-js";
import { useLocation } from "solid-start";
import { createShortcut } from "~/hooks/createShortcut";
import { setHeaderState } from "../Header/Header";
import Search from "./Search";

const SearchModal: Component<{
  menuButton: HTMLElement;
  open: Accessor<boolean>;
  setOpen: (value: boolean) => void;
}> = ({ menuButton, open, setOpen }) => {
  const location = useLocation();

  // TODO: ONLY WORKS ONCE?? (sometimes it works again)
  // but is same code as https://github.com/solidjs-community/solid-primitives/blob/main/packages/keyboard/dev/index.tsx#L37 and that works
  // seems like interacting with tabbable items silences the event or something
  createShortcut(["Meta", "K"], () => {
    setOpen(true);
  });
  createShortcut(["Control", "K"], () => {
    setOpen(true);
  });

  createEffect(
    on(
      () => location.pathname,
      (currentPathname, prevPathname) => {
        if (prevPathname === currentPathname) return;
        setOpen(false);
      },
      { defer: true }
    )
  );

  return (
    <Dismiss
      menuButton={menuButton}
      modal
      open={open}
      setOpen={setOpen}
      overlayElement={{
        element: (
          <div
            class="fixed inset-0 z-[1000] will-change-transform"
            onClick={() => {
              setOpen(false);
              requestAnimationFrame(() => {
                menuButton.focus();
              });
            }}
          >
            <div class="h-full mt-[60px] bg-[#102a62b8] dark:bg-[#001627bd] backdrop-blur-sm" />
          </div>
        ),
        animation: {
          name: "fade-opacity"
        }
      }}
      onOpen={open => {
        setHeaderState("showSearchBtn", !open);
      }}
      animation={{
        name: "fade-opacity"
      }}
      focusElementOnOpen="firstChild"
    >
      <div
        class="fixed top-[80px] left-0 right-0 flex justify-center pointer-events-none"
        role="presentation"
      >
        <div class="pointer-events-auto" role="dialog" aria-modal="true" tabindex="-1">
          <Search />
        </div>
      </div>
    </Dismiss>
  );
};

export default SearchModal;

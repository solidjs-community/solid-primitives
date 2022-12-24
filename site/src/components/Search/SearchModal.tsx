import { createShortcut } from "@solid-primitives/keyboard";
import Dismiss from "solid-dismiss";
import { Accessor, Component, createEffect, on } from "solid-js";
import { useLocation } from "solid-start";
import Search from "./Search";

const SearchModal: Component<{
  menuButton: Element;
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
        class: "bg-[#102a62b8] backdrop-blur-md !top-[60px]"
      }}
      focusElementOnOpen="firstChild"
    >
      <div
        class="fixed top-[80px] left-0 right-0 flex justify-center pointer-events-none"
        role="presentation"
      >
        <div
          class="pointer-events-auto"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          // ref={modalEl}
        >
          <Search />
        </div>
      </div>
    </Dismiss>
  );
};

export default SearchModal;

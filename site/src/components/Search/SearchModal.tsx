import Dismiss from "solid-dismiss";
import { Accessor, Component, ParentComponent } from "solid-js";
import Search from "./Search";

const SearchModal: Component<{
  menuButton: Element;
  open: Accessor<boolean>;
  setOpen: (value: boolean) => void;
}> = ({ menuButton, open, setOpen }) => {
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

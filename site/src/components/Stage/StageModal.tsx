import Dismiss from "solid-dismiss";
import { FiX } from "solid-icons/fi";
import { Accessor, Component } from "solid-js";
import Stage from "./Stage";

const StageModal: Component<{
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
        class: "bg-[#102a62b8] dark:bg-[#001627bd] backdrop-blur-md !top-[60px]"
      }}
    >
      <div
        class="fixed top-[80px] left-0 right-0 px-2 flex justify-center pointer-events-none"
        role="presentation"
      >
        <div
          class="pointer-events-auto relative"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          // ref={modalEl}
        >
          <Stage />
          <button
            class="absolute top-0 right-0 w-[45px] h-[45px] rounded-lg text-[#306FC4] flex justify-center items-center dark:text-[#c2d5ee] dark:hover:text-white"
            onClick={() => {
              setOpen(false);
            }}
          >
            <FiX size={25} />
          </button>
        </div>
      </div>
    </Dismiss>
  );
};

export default StageModal;

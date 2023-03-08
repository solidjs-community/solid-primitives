import { ParentComponent } from "solid-js";
import { A } from "solid-start";

const PrimitiveBtn: ParentComponent<{ href: string }> = props => {
  return (
    <A
      href={`/package/${props.href}`}
      class="flex-shrink-0 text-[14px] sm:text-base text-[#063983] font-semibold px-2 hover:text-[#00275f] hover:bg-[#d0e4ff87] rounded-md transition-colors dark:text-[#d0dff2] dark:hover:text-[#eff6ff] dark:hover:bg-[#566e8e87]"
    >
      {props.children}
    </A>
  );
};

export default PrimitiveBtn;

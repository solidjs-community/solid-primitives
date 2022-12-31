import { ParentComponent } from "solid-js";

const PrimitiveBtn: ParentComponent<{ href: string }> = props => {
  return (
    <div>
      <a
        href={props.href}
        class="text-[14px] sm:text-base text-[#063983] font-semibold pt-1 px-2 pb-0 my-2 hover:bg-[#d0e4ff87] rounded-md inline-block transition-colors dark:text-[#eff6ff] dark:hover:bg-[#566e8e87]"
      >
        {props.children}
      </a>
    </div>
  );
};

export default PrimitiveBtn;

import { type ParentComponent } from "solid-js";
import { Link } from "@tanstack/solid-router";

const PrimitiveBtn: ParentComponent<{ href: string }> = props => {
  return (
    <Link
      // `href` may contain a trailing `#hash`; pass as plain string (not type-safe)
      to={`/package/${props.href}` as any}
      class="flex-shrink-0 rounded-md px-2 text-[14px] font-semibold text-[#063983] transition-colors hover:bg-[#d0e4ff87] hover:text-[#00275f] sm:text-base dark:text-[#d0dff2] dark:hover:bg-[#566e8e87] dark:hover:text-[#eff6ff]"
    >
      {props.children}
    </Link>
  );
};

export default PrimitiveBtn;

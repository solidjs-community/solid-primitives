import { createSignal, onMount, ParentComponent } from "solid-js";

const createFetchSize = (value: string) => {
  const [size, setSize] = createSignal("");
  onMount(() => {
    const fetchValue = async () => {
      try {
        const response = await fetch(value);
        const json = (await response.json()) as { value: string };
        setSize(json.value);
      } catch (err) {}
    };
    fetchValue();
  });

  return size;
};

const SizeBadge: ParentComponent<{ value: string; href: string }> = ({ value, href }) => {
  const size = createFetchSize(value);

  return (
    <a
      class="h-[28px] min-w-[90px] uppercase flex justify-center items-center font-sans rounded-md border-[#cae0ff] bg-[#cae0ff40] border-2 hover:border-[#80a7de] hover:bg-[#cae0ff66] transition-colors dark:bg-[#6eaaff14] dark:border-[#5577a7] dark:hover:border-[#8ba8d3] dark:hover:bg-[#6eaaff33]"
      href={href}
      target="_blank"
    >
      {size()}
    </a>
  );
};

export const SizeBadgePill: ParentComponent<{ value: string; href: string }> = ({
  value,
  href
}) => {
  const size = createFetchSize(value);

  return (
    <a
      class="flex uppercase font-sans hover:contrast-[1.2] transition-filter"
      href={href}
      target="_blank"
    >
      <div class="flex items-center rounded-l-lg h-[38px] border-[#cae0ff] px-4 border-[3px] bg-[#cae0ff40] dark:border-[#405b6e] dark:bg-[#2a4355]">
        Size
      </div>
      <div class="h-full flex justify-center items-center min-w-[90px] rounded-r-lg border-l-0 border-transparent border-[3px] font-semibold background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#cae0ff,#c0c8ff)_border-box] dark:background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#405b6e,#46659a)_border-box]">
        {size()}
      </div>
    </a>
  );
};

export default SizeBadge;

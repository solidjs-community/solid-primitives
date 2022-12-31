import { createSignal, onMount, ParentComponent } from "solid-js";

const createFetchVersion = (value: string) => {
  const [version, setVersion] = createSignal("");

  onMount(() => {
    const fetchValue = async () => {
      try {
        const response = await fetch(value);
        const json = (await response.json()) as { message: string; color: string };
        setVersion(json.message);
        // setColor(updateColor(json.color as "green"));
      } catch (err) {}
    };
    fetchValue();
  });

  return version;
};

const VersionBadge: ParentComponent<{ value: string; href: string }> = ({ value, href }) => {
  const [color, setColor] = createSignal("");
  const version = createFetchVersion(value);

  const updateColor = (
    color:
      | "brightgreen"
      | "green"
      | "yellowgreen"
      | "yellow"
      | "orange"
      | "red"
      | "blue"
      | "lightgrey"
  ) => {
    switch (color) {
      case "brightgreen":
      case "yellowgreen":
      case "yellow":
        return "bg-[#E9DE47] text-black";
      case "orange":
        return "bg-[#FFA15C] text-black";
      case "red":
        return "bg-[#FFA15C] text-black";
      case "blue":
        return "bg-[#2962FF] text-white";
      case "lightgrey":
        return "bg-[lightgrey] text-white";
      default:
        return "bg-[lightgrey] text-white";
    }
  };

  return (
    <a
      class="h-[28px] min-w-[90px] uppercase flex justify-center items-center font-sans rounded-md border-[#cae0ff] bg-[#cae0ff40] border-2 dark:bg-[#6eaaff14] dark:border-[#5577a7]"
      href={href}
      target="_blank"
    >
      {version()}
    </a>
  );
};

export const VersionBadgePill: ParentComponent<{ value: string; href: string }> = ({
  value,
  href
}) => {
  const version = createFetchVersion(value);

  return (
    <a
      class="flex uppercase font-sans hover:contrast-[1.2] transition-filter"
      href={href}
      target="_blank"
    >
      <div class="flex items-center rounded-l-lg h-[38px] border-[#cae0ff] px-4 border-[3px] bg-[#cae0ff40] dark:border-[#405b6e] dark:bg-[#2a4355]">
        NPM
      </div>
      <div class="h-full flex justify-center items-center min-w-[90px] rounded-r-lg border-l-0 border-transparent border-[3px] font-semibold background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#cae0ff,#c0c8ff)_border-box] dark:background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#405b6e,#46659a)_border-box]">
        {version()}
      </div>
    </a>
  );
};

export default VersionBadge;

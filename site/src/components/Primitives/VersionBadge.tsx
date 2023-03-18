import { createSignal, onMount, ParentComponent } from "solid-js";

const createFetchVersion = (value: string) => {
  const [version, setVersion] = createSignal("");

  onMount(() => {
    const fetchValue = async () => {
      try {
        const response = await fetch(value);
        const json = (await response.json()) as { message: string; color: string };
        setVersion(json.message.replace(/^v/, ""));
        // setColor(updateColor(json.color as "green"));
      } catch (err) {}
    };
    fetchValue();
  });

  return version;
};

const VersionBadge: ParentComponent<{ value: string; href?: string }> = ({ value, href }) => {
  const [color, setColor] = createSignal("");
  // const version = createFetchVersion(value);

  const updateColor = (
    color:
      | "brightgreen"
      | "green"
      | "yellowgreen"
      | "yellow"
      | "orange"
      | "red"
      | "blue"
      | "lightgrey",
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
      class="flex h-[28px] min-w-[90px] items-baseline justify-center rounded-md border-2 border-[#cae0ff] bg-[#cae0ff40] font-sans transition-colors hover:border-[#80a7de] hover:bg-[#cae0ff66] dark:border-[#5577a7] dark:bg-[#6eaaff14] dark:hover:border-[#8ba8d3] dark:hover:bg-[#6eaaff33]"
      href={href}
      rel="noopener"
      target="_blank"
    >
      <span class="text-[14px] font-semibold text-[#7689a4] dark:text-[#8b9eba]">v</span>
      {value}
    </a>
  );
};

export const VersionBadgePill: ParentComponent<{ value: string; href?: string }> = ({
  value,
  href,
}) => {
  // const version = createFetchVersion(value);

  return (
    <a
      class="transition-filter flex font-sans hover:contrast-[1.2]"
      href={href}
      target="_blank"
      rel="noopener"
    >
      <div class="flex h-[38px] items-center rounded-l-lg border-[3px] border-[#cae0ff] bg-[#cae0ff40] px-4 dark:border-[#405b6e] dark:bg-[#2a4355]">
        NPM
      </div>
      <div class="background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#cae0ff,#c0c8ff)_border-box] dark:background-[linear-gradient(var(--page-main-bg),var(--page-main-bg))_padding-box,_linear-gradient(to_right,#405b6e,#46659a)_border-box] flex h-full min-w-[90px] items-center justify-center rounded-r-lg border-[3px] border-l-0 border-transparent font-semibold">
        <span>v</span>
        {value}
      </div>
    </a>
  );
};

export default VersionBadge;

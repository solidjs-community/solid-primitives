import type { Component } from "solid-js";
import DefaultFooter from "@kobalte/solidbase/default-theme/components/Footer";

const SiteFooter: Component = () => {
  const year = new Date().getFullYear();

  return (
    <>
      <DefaultFooter />
      <div
        style={{
          "font-size": "13px",
          color: "var(--sb-decoration-color)",
          "padding-bottom": "2rem",
          "margin-top": "-1rem",
        }}
      >
        {"© "}
        {year}
        {" Solid Primitives Working Group · "}
        <a
          href="https://github.com/solidjs-community/solid-primitives/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", "text-decoration": "underline" }}
        >
          MIT License
        </a>
      </div>
    </>
  );
};

export default SiteFooter;

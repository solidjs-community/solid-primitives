import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { Link } from "@kobalte/core";
import StageBadge from "./StageBadge.js";

const PackageMeta: Component<{
  name: string;
  stage: number;
  category: string;
  version: string;
  primitives: string[];
  lastUpdated?: number;
}> = props => {
  const formattedDate = () => {
    if (!props.lastUpdated) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(props.lastUpdated),
    );
  };
  return (
    <div
      style={{
        display: "flex",
        "flex-wrap": "wrap",
        gap: "10px",
        "align-items": "center",
        margin: "1.5rem 0",
        padding: "14px 18px",
        border: "1px solid color-mix(in srgb, var(--sb-decoration-color) 50%, transparent)",
        "border-radius": "10px",
        "background-color": "var(--sb-code-background-color)",
        "font-size": "14px",
      }}
    >
      {/* Stage */}
      <div style={{ display: "flex", "align-items": "center", gap: "6px" }}>
        <span style={{ color: "var(--sb-decoration-color)", "font-weight": "500" }}>
          Stage
        </span>
        <StageBadge stage={props.stage} />
      </div>

      {/* Category */}
      <div style={{ display: "flex", "align-items": "center", gap: "6px" }}>
        <span style={{ color: "var(--sb-decoration-color)", "font-weight": "500" }}>
          Category
        </span>
        <span
          style={{
            padding: "2px 10px",
            "border-radius": "999px",
            background: "var(--sb-highlight-background-color)",
            color: "var(--sb-active-link-color)",
            "font-weight": "500",
          }}
        >
          {props.category}
        </span>
      </div>

      {/* NPM version link */}
      <Link.Root
        href={`https://www.npmjs.com/package/@solid-primitives/${props.name}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          "align-items": "center",
          gap: "4px",
          padding: "3px 10px",
          "border-radius": "999px",
          border: "1px solid color-mix(in srgb, var(--sb-decoration-color) 50%, transparent)",
          "text-decoration": "none",
          color: "var(--sb-text-color)",
          "font-weight": "500",
        }}
      >
        npm v{props.version}
      </Link.Root>

      {/* Last updated */}
      <Show when={formattedDate()}>
        {date => (
          <span style={{ color: "var(--sb-decoration-color)", "font-size": "13px" }}>
            Updated {date()}
          </span>
        )}
      </Show>

      {/* Primitives list */}
      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "6px", width: "100%" }}>
        <span style={{ color: "var(--sb-decoration-color)", "font-weight": "500" }}>
          Exports
        </span>
        <For each={props.primitives}>
          {primitive => (
            <code
              style={{
                padding: "1px 7px",
                "border-radius": "4px",
                background: "var(--sb-code-background-color)",
                color: "var(--sb-code-text-color)",
                "font-size": "13px",
              }}
            >
              {primitive}
            </code>
          )}
        </For>
      </div>
    </div>
  );
};

export default PackageMeta;

import { For } from "solid-js";
import type { Component } from "solid-js";
import { Link } from "@kobalte/core";
import StageBadge from "./StageBadge.js";
// @ts-ignore – JSON import assertion needed for Vite/Node
import packagesData from "../_generated/packages.json" with { type: "json" };

type PackageListItem = {
  name: string;
  version: string;
  description: string;
  category: string;
  stage: number;
  primitive: {
    list: string[];
    category: string;
    stage: number;
  } | null;
};

const packages = packagesData as PackageListItem[];

// Group by category
const grouped: [string, PackageListItem[]][] = (() => {
  const map: Record<string, PackageListItem[]> = {};
  for (const pkg of packages) {
    if (!map[pkg.category]) map[pkg.category] = [];
    map[pkg.category]!.push(pkg);
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
})();

const PrimitivesTable: Component = () => {
  return (
    <div style={{ "overflow-x": "auto", margin: "2rem 0" }}>
      <table
        style={{
          width: "100%",
          "border-collapse": "collapse",
          "font-size": "14px",
        }}
      >
        <thead>
          <tr
            style={{
              "border-bottom": "2px solid var(--sb-decoration-color)",
              "text-align": "left",
            }}
          >
            <th style={{ padding: "8px 12px" }}>Package</th>
            <th style={{ padding: "8px 12px", width: "60px", "text-align": "center" }}>Stage</th>
            <th style={{ padding: "8px 12px" }}>Exports</th>
            <th style={{ padding: "8px 12px", width: "80px" }}>NPM</th>
          </tr>
        </thead>
        <tbody>
          <For each={grouped}>
            {([category, items]) => (
              <>
                <tr>
                  <td
                    colspan={4}
                    style={{
                      padding: "14px 12px 6px",
                      "font-weight": "700",
                      "font-size": "13px",
                      "text-transform": "uppercase",
                      "letter-spacing": "0.06em",
                      color: "var(--sb-decoration-color)",
                      "border-top": "1px solid var(--sb-decoration-color)",
                    }}
                  >
                    {category}
                  </td>
                </tr>
                <For each={items}>
                  {pkg => (
                    <tr
                      style={{
                        "border-bottom": "1px solid color-mix(in srgb, var(--sb-decoration-color) 40%, transparent)",
                      }}
                    >
                      <td style={{ padding: "8px 12px" }}>
                        <Link.Root
                          href={`/packages/${pkg.name}`}
                          style={{
                            "font-weight": "600",
                            color: "var(--sb-active-link-color)",
                            "text-decoration": "none",
                          }}
                        >
                          {pkg.name}
                        </Link.Root>
                      </td>
                      <td style={{ padding: "8px 12px", "text-align": "center" }}>
                        <StageBadge stage={pkg.stage} />
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <div
                          style={{
                            display: "flex",
                            "flex-wrap": "wrap",
                            gap: "4px",
                          }}
                        >
                          <For each={pkg.primitive?.list ?? []}>
                            {name => (
                              <code
                                style={{
                                  "font-size": "12px",
                                  padding: "1px 5px",
                                  "border-radius": "3px",
                                  background: "var(--sb-code-background-color)",
                                  color: "var(--sb-code-text-color)",
                                  border: "1px solid color-mix(in srgb, var(--sb-decoration-color) 50%, transparent)",
                                }}
                              >
                                {name}
                              </code>
                            )}
                          </For>
                        </div>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <Link.Root
                          href={`https://www.npmjs.com/package/@solid-primitives/${pkg.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            "font-size": "12px",
                            color: "var(--sb-decoration-color)",
                            "text-decoration": "none",
                          }}
                        >
                          v{pkg.version}
                        </Link.Root>
                      </td>
                    </tr>
                  )}
                </For>
              </>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default PrimitivesTable;

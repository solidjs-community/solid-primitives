import { writeFile, writeFileSync } from "fs";
import { PackageData, PackageJSONData } from ".";
import { r } from "../utils";

const categories: Record<string, PackageData[]> = {};
const rootDependencies: string[] = [];

const githubURL = "https://github.com/solidjs-community/solid-primitives/tree/main/packages/";
const sizeShield = "https://img.shields.io/bundlephobia/minzip/";
const bundlephobiaURL = "https://bundlephobia.com/package/";
const npmShield = "https://img.shields.io/npm/v/";
const npmURL = "https://www.npmjs.com/package/";
const stageShieldBaseURL =
  "https://img.shields.io/endpoint?style=for-the-badge&label=&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-"; // add "<stage>.json" after
const stageShieldLink =
  "https://github.com/solidjs-community/solid-primitives#contribution-process";

export const getSizeShield = (name: string) => `${sizeShield}${name}.json`;
export const getNPMShield = (name: string) => `${npmShield}${name}.json`;

export const buildCategory = ({ name, pkg }: { name: string; pkg: PackageJSONData }) => {
  const { list, category, stage } = pkg.primitive;

  const data = {} as PackageData;

  // data.Name = `[${name}](${githubURL}${name}#readme)`;
  data.Name = name;
  // Detect the stage and build size/version only if needed
  if (data.Stage == "X" || data.Stage == 0) {
    data.Size = "";
    data.NPM = "";
  } else {
    // data.Size = `[![SIZE](${sizeShield}${pkg.name}?style=for-the-badge&label=)](${bundlephobiaURL}${pkg.name})`;
    data.Size = getSizeShield(pkg.name);
    data.NPM = getNPMShield(pkg.name);
  }
  // data.Stage = `[![STAGE](${stageShieldBaseURL}${stage ?? "2"}.json)](${stageShieldLink})`;
  data.Stage = stage ?? "2";
  data.Primitives = list
    // .map(prim => `[${prim}](${githubURL}${name}#${prim.replace(/ /g, "-").toLowerCase()})`)
    .map(prim => {
      const primitiveRoute = `/${name}#${prim.toLowerCase().replace(/\s/g, "-")}`;
      return `<PrimitiveBtn href="${primitiveRoute}">${prim}</PrimitiveBtn>`;
    })
    .join("");
  // .join("<br />");
  // Merge the package into the correct category
  let cat = category || "Misc";
  categories[cat] = Array.isArray(categories[cat]) ? [...categories[cat], data] : [data];

  // build
};

export const writeHTMLTableFile = () => {
  const pathToTableComponent = r("../site/src/components/Primitives/PrimitivesTable.tsx");
  // let tableComp = readFileSync(pathToTableComponent).toString();

  // Update Primitives Table
  const headers = ["Name", "Stage", "Primitives", "Size", "NPM"];
  const startTable = `
  <Table>
    <THead>
      ${headers.map(name => `<TH>${name}</TH>`).join("")}
    </THead>
    <tbody>
  `;
  const endTable = `
    </tbody>
  </Table>
  `;

  const tbody = Object.entries(categories).reduce((html, [category, items]) => {
    let tr = `
    <TR>
      <TD h4 >${category}</TD>
      ${`<TD></TD>`.repeat(headers.length - 1)}
    </TR>
    `;

    tr += items
      .map(item => {
        const renderItems = () => {
          return headers
            .map(_name => {
              const name = _name as keyof PackageData;

              const value = item[name];
              const primitiveNameRoute = typeof value === "string" ? value.toLowerCase() : "";

              const renderComp = () => {
                switch (name) {
                  case "Stage":
                    return `<StageBadge value={${value}}/>`;
                  case "NPM":
                    return `<VersionBadge value="${value}" href="${npmURL}@solid-primitives/${item.Name}"/>`;
                  case "Size":
                    return `<SizeBadge value="${value}" href="${bundlephobiaURL}@solid-primitives/${item.Name}"/>`;
                  case "Name":
                    return `<PrimitiveBtn href="${primitiveNameRoute}">${value}</PrimitiveBtn>`;
                  default:
                    return value;
                }
              };

              return `<TD>${renderComp()}</TD>`;
            })
            .join("");
        };
        return `
        <TR>
          ${renderItems()}
        </TR>
        `;
      })
      .join("");
    html += tr;

    return html;
  }, "");

  const table = startTable + tbody + endTable;

  const componentStr = `
// Do not modify
// Generated from "./scripts/update-site/build-html-table"

import THead from "./THead"
import Table from "./Table"
import TH from "./TH"
import TD from "./TD"
import TR from "./TR"
import SizeBadge from "./SizeBadge"
import VersionBadge from "./VersionBadge"
import StageBadge from "./StageBadge"
import PrimitiveBtn from "./PrimitiveBtn"

const PrimitivesTable = () => {
  return (${table})
}
export default PrimitivesTable
`;

  writeFile(pathToTableComponent, componentStr, err => {
    if (err) console.log(err);
  });
};

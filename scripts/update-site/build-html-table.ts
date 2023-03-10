import { existsSync, mkdirSync, writeFile, writeFileSync } from "fs";
import { PackageData, PackageJSONData, TUpdateSiteGlobal } from ".";
import { formatBytes, r } from "../utils";
import checkSizeOfPackage from "../checkSizeOfPackage";

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
const bundleJSURL = `https://bundlejs.com/`;
const getBundleJSQuery = ({
  type,
  packageName,
  primitiveName,
}: {
  type: "package" | "export";
  packageName: string;
  primitiveName: string;
}) => {
  const esbuild = {
    external: ["solid-js", "node-fetch"],
  };
  const query = encodeURIComponent(`@solid-primitives/${packageName}`);
  const treeshake = encodeURIComponent(`[{${primitiveName}}]`);
  const config = encodeURIComponent(`{"esbuild":${JSON.stringify(esbuild)}}`);
  return `q=${query}${type === "export" ? `&treeshake=${treeshake}` : ""}&config=${config}`;
};

export const getSizeShield = (name: string) => `${sizeShield}${name}.json`;
export const getNPMShield = (name: string) => `${npmShield}${name}.json`;

export const buildCategory = async ({
  name,
  pkg,
  globalState,
}: {
  name: string;
  pkg: PackageJSONData;
  globalState: TUpdateSiteGlobal;
}) => {
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
    const getSizes = async () => {
      const run = async () => {
        return Promise.all(
          list.map(async (prim, idx, self) => {
            const type = prim.match(/\s/) ? "package" : "export";
            const packageName = name;
            const primitiveName = prim;

            if (type === "package" || idx === 0) {
              const result = await checkSizeOfPackage({
                type: "package",
                packageName,
                primitiveName,
                excludeGzipHeadersAndMetadataSize: true,
              });
              const minified = formatBytes(result.minifiedSize);
              const gzipped = formatBytes(result.gzippedSize);

              globalState.packageName[packageName] = {
                name: packageName,
                size: {
                  gzipped,
                  minified,
                },
              };
            }

            const result = await checkSizeOfPackage({
              type,
              packageName,
              primitiveName,
              excludeGzipHeadersAndMetadataSize: true,
            });
            const minified = formatBytes(result.minifiedSize);
            const gzipped = formatBytes(result.gzippedSize);

            if (type === "export") {
              globalState.primitives[primitiveName] = {
                packageName,
                size: {
                  gzipped,
                  minified,
                },
              };
            }

            // const value = `{ gzipped: "${gzippedSize}", minified: "${minifiedSize}" }`;
            const value = gzipped.number;
            const unit = gzipped.unit;
            const query = getBundleJSQuery({
              type,
              packageName,
              primitiveName,
            });
            const href = `${bundleJSURL}?${query}`;

            const component = `<SizeBadge value="${value}" unit="${unit}" href="${href}" />`;

            return `<SizeBadgeWrapper primitiveName="${primitiveName.replace(
              /\s/g,
              "",
            )}">${component}</SizeBadgeWrapper>`;
          }),
        );
      };
      return (await run()).join("");
    };

    data.Size = await getSizes();
    data.NPM = getNPMShield(pkg.name);
  }
  data.Stage = stage ?? "2";
  data.Primitives = list
    .map(prim => {
      const primitiveRoute = `/${name}#${prim.toLowerCase().replace(/\s/g, "-")}`;
      const component = `<PrimitiveBtn href="${primitiveRoute}">${prim}</PrimitiveBtn>`;
      return `<PrimitiveBtnLineWrapper primitiveName="${prim}">${component}</PrimitiveBtnLineWrapper>`;
    })
    .join("");
  // .join("<br />");
  // Merge the package into the correct category
  let cat = category || "Misc";
  categories[cat] = Array.isArray(categories[cat]) ? [...categories[cat]!, data] : [data];

  // build
};

export const writeHTMLTableFile = () => {
  const pathToTableComponent = r("../site/src/_generated/Primitives/PrimitivesTable.tsx");
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
                    return value;
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

import THead from "~/components/Primitives/THead"
import Table from "~/components/Primitives/Table"
import TH from "~/components/Primitives/TH"
import TD from "~/components/Primitives/TD"
import TR from "~/components/Primitives/TR"
import SizeBadge from "~/components/Primitives/SizeBadge"
import { SizeBadgeWrapper } from "~/components/Primitives/SizeBadge"
import VersionBadge from "~/components/Primitives/VersionBadge"
import StageBadge from "~/components/Primitives/StageBadge"
import PrimitiveBtn from "~/components/Primitives/PrimitiveBtn"
import PrimitiveBtnLineWrapper from "~/components/Primitives/PrimitiveBtnLineWrapper"

const PrimitivesTable = () => {
  return (${table})
}
export default PrimitivesTable
`;

  const pathToPrimitivesDir = r("../site/src/_generated/Primitives");
  if (!existsSync(pathToPrimitivesDir)) {
    mkdirSync(pathToPrimitivesDir);
  }

  writeFile(pathToTableComponent, componentStr, err => {
    if (err) console.log(err);
  });
};

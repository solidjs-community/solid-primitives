import path from "path";
import fs from "fs";
import {
  PACKAGES_DIR,
  checkValidPackageName,
  formatBytes,
  getPackageBundlesize,
  logLine,
} from "./utils";
import { PackageJson } from "type-fest";

if (process.argv.length < 3)
  throw new Error(
    "measure script requires a package name argument. e.g. `pnpm measure event-listener`",
  );

const name = process.argv[2];

if (!name || !checkValidPackageName(name))
  throw new Error(`Incorrect package name argument: "${name}"`);

const packageDir = path.join(PACKAGES_DIR, name);

class ConsoleTable {
  rows: string[][] = [];

  addRow(row: string[]) {
    this.rows.push(row);
  }

  addSeparator() {
    this.rows.push([]);
  }

  log() {
    const columnWidths = this.rows.reduce((columnWidths, row) => {
      row.forEach((cell, i) => {
        const cellWidth = cell.length;
        columnWidths[i] = Math.max(columnWidths[i] || 0, cellWidth);
      });
      return columnWidths;
    }, [] as number[]);

    const separator = columnWidths.map(columnWidth => "—".repeat(columnWidth)).join(" + ");

    for (const row of this.rows) {
      logLine(
        row.length === 0
          ? separator
          : columnWidths
              .map((columnWidth, i) => {
                if (!row[i]) return " ".repeat(columnWidth);
                const cellWidth = row[i]!.length;
                const padding = " ".repeat(columnWidth - cellWidth);
                return row[i] + padding;
              })
              .join(" | "),
      );
    }

    this.rows = [];
  }
}

(async () => {
  const pkg = JSON.parse(
    await fs.readFileSync(path.join(packageDir, "package.json"), "utf8"),
  ) as PackageJson;

  if (!pkg.primitive || !Array.isArray((pkg.primitive as any).list)) {
    throw new Error(`Package ${name} does not have a valid primitive list.`);
  }

  const primitives = (pkg.primitive as any).list as string[];
  const peerDependencies = Object.keys(pkg.peerDependencies || {});

  logLine(`Measuring "@solid-primitives/${name}"...\n`);

  const primitivesSizesPromises = primitives.map(primitive =>
    getPackageBundlesize(name, { exportName: primitive, peerDependencies }),
  );
  const packageSizePromise = getPackageBundlesize(name, { peerDependencies });

  const [primitivesSizes, packageSize] = await Promise.all([
    Promise.all(primitivesSizesPromises),
    packageSizePromise,
  ] as const);

  const table = new ConsoleTable();

  table.addRow(["Primitive", "Min", "Gzip"]);
  table.addSeparator();

  primitivesSizes.forEach((size, i) => {
    table.addRow([
      primitives[i]!,
      size ? formatBytes(size.min).join(" ") : "N/A",
      size ? formatBytes(size.gzip).join(" ") : "N/A",
    ]);
  });
  table.addSeparator();

  table.addRow([
    "Total",
    packageSize ? formatBytes(packageSize.min).join(" ") : "N/A",
    packageSize ? formatBytes(packageSize.gzip).join(" ") : "N/A",
  ]);

  table.log();

  logLine(`
  ${primitivesSizes.every(size => size) ? "✅" : "❌"} All primitives measured successfully.
  ${packageSize ? "✅" : "❌"} Measured the package successfully.
  `);
})();

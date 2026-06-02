import * as path from "node:path";
import * as fsp from "node:fs/promises";
import * as utils from "./utils/index.js";

const args = process.argv.slice(2);
const saveFlag = args.includes("--save");
const positional = args.filter(a => !a.startsWith("--"));

// Resolve target package(s)
const nameFromArg = positional[0];
const nameFromCwd = utils.getPackageNameFromCWD();

let targetNames: string[];

if (nameFromArg) {
  if (!utils.checkValidPackageName(nameFromArg))
    throw new Error(`Incorrect package name argument: "${nameFromArg}"`);
  targetNames = [nameFromArg];
} else if (nameFromCwd) {
  targetNames = [nameFromCwd];
} else {
  const allModules = await utils.getModulesData();
  targetNames = allModules.filter(m => m.primitive != null).map(m => m.name);
  utils.log_info(`Measuring all ${targetNames.length} packages...\n`);
}

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
        columnWidths[i] = Math.max(columnWidths[i] || 0, cell.length);
      });
      return columnWidths;
    }, [] as number[]);

    const separator = columnWidths.map(w => "—".repeat(w)).join(" + ");

    for (const row of this.rows) {
      utils.log_info(
        row.length === 0
          ? separator
          : columnWidths
              .map((w, i) => {
                if (!row[i]) return " ".repeat(w);
                return row[i] + " ".repeat(w - row[i].length);
              })
              .join(" | "),
      );
    }

    this.rows = [];
  }
}

async function measurePackage(name: string): Promise<void> {
  const module = await utils.getModuleData(name);
  if (module instanceof Error) {
    utils.log_error(module.message);
    return;
  }
  if (module.primitive == null) {
    utils.log_error(`Package ${name} doesn't have primitive data in package.json`);
    return;
  }

  const primitives = module.primitive.list;
  const peerDependencies = module.peer_deps;

  utils.log_info(`Measuring "@solid-primitives/${name}"...\n`);

  const [primitivesSizes, packageSize] = await Promise.all([
    Promise.all(
      primitives.map(p => utils.getPackageBundlesize(name, { exportName: p, peerDependencies })),
    ),
    utils.getPackageBundlesize(name, { peerDependencies }),
  ] as const);

  const table = new ConsoleTable();
  table.addRow(["Primitive", "Min", "Gzip"]);
  table.addSeparator();

  primitivesSizes.forEach((size, i) => {
    table.addRow([
      primitives[i]!,
      size ? utils.formatBytes(size.min).join(" ") : "N/A",
      size ? utils.formatBytes(size.gzip).join(" ") : "N/A",
    ]);
  });

  table.addSeparator();
  table.addRow([
    "Total",
    packageSize ? utils.formatBytes(packageSize.min).join(" ") : "N/A",
    packageSize ? utils.formatBytes(packageSize.gzip).join(" ") : "N/A",
  ]);
  table.log();

  utils.log_info(
    `${primitivesSizes.every(s => s) ? "✅" : "❌"} All primitives measured successfully.\n` +
      `${packageSize ? "✅" : "❌"} Measured the package successfully.`,
  );

  if (saveFlag && packageSize) {
    const pkgDir = path.join(utils.PACKAGES_DIR, name);
    const pkgPath = path.join(pkgDir, "package.json");
    const raw = await fsp.readFile(pkgPath, "utf8");
    const indentMatch = raw.match(/^(\s+)"/m);
    const indent = indentMatch ? indentMatch[1]! : "  ";
    const pkg = JSON.parse(raw);
    if (pkg.primitive) {
      pkg.primitive.gzip = packageSize.gzip;
      await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, indent) + "\n");
      utils.log_info(
        `💾 Saved gzip size (${utils.formatBytes(packageSize.gzip).join(" ")}) → ${name}/package.json`,
      );
    }

    const readmePath = path.join(pkgDir, "README.md");
    if (await utils.pathExists(readmePath)) {
      const readme = await fsp.readFile(readmePath, "utf8");
      const [value, unit] = utils.formatBytes(packageSize.gzip);
      const sizeStr = `${value}_${unit}`;
      const fullName = `@solid-primitives/${name}`;
      const newBadge = `[![size](https://img.shields.io/badge/size-${sizeStr}-blue?style=for-the-badge)](https://bundlephobia.com/package/${fullName})`;
      const updated = readme.replace(
        /\[!\[size\]\([^)]+\)\]\(https:\/\/bundlephobia\.com\/package\/@solid-primitives\/[^)]+\)/,
        newBadge,
      );
      if (updated !== readme) {
        await fsp.writeFile(readmePath, updated);
        utils.log_info(`📝 Updated size badge → ${name}/README.md\n`);
      }
    }
  }
}

for (const name of targetNames) {
  await measurePackage(name);
}

import child_process from "node:child_process";
import * as utils from "./utils/index.js";
import path from "path";

const cwd = process.cwd();
const args = process.argv.slice(2);
const package_name = path.basename(cwd);

utils.logLine(
  `Starting dev server for the ${package_name} package...\n
Visit the playground at http://localhost:3000/playground/${package_name} to test your changes.`,
);

// execute dev script
child_process.spawn("pnpm", ["run", "dev", ...args], {
  stdio: "inherit",
  shell: true,
  cwd: utils.ROOT_DIR,
});

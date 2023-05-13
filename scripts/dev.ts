import childProcess from "node:child_process";
import { ROOT_DIR, logLine } from "./utils";

const cwd = process.cwd();
const args = process.argv.slice(2);
const packageName = cwd.split("\\").pop();

logLine(
  `Starting dev server for the ${packageName} package...\n
Visit the playground at http://localhost:3000/playground/${packageName} to test your changes.`,
);

// execute dev script
childProcess.spawn("pnpm", ["run", "dev", ...args], {
  stdio: "inherit",
  shell: true,
  cwd: ROOT_DIR,
});

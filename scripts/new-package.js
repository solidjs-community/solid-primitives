const shell = require("child_process").execSync;
const { join } = require("path");
const packageName = process.argv.pop();
const src = join(__dirname, "../template");
const dest = join(__dirname, "../packages", packageName);
shell(`mkdir -p ${dest}`);
shell(`cp -r ${src}/* ${dest}`);

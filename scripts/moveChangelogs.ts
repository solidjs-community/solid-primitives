import { readdirSync, readFileSync, writeFileSync } from "fs";
import { pathTo } from "./utils";

readdirSync(pathTo(`../packages/`)).forEach(name => {
  const readme = readFileSync(pathTo(`../packages/${name}/README.md`), "utf8");
  const { version } = JSON.parse(readFileSync(pathTo(`../packages/${name}/package.json`), "utf8"));

  // console.log(readme);

  // get string between "## Changelog" and the end of the file with regex
  const changelogIndex = readme.search(/## Changelog/);
  let nextHeadingIndex = readme.indexOf("## ", changelogIndex + 1);
  nextHeadingIndex = nextHeadingIndex === -1 ? readme.length : nextHeadingIndex;

  const before = readme.substring(0, changelogIndex);
  const changelogChunk = readme.substring(changelogIndex, nextHeadingIndex);
  const after = readme.substring(nextHeadingIndex);

  const changelogMatch =
    /\<details\>\r?\n?\<summary\>\<b\>Expand Changelog\<\/b\>\<\/summary\>([\S\s]+)<\/details>/g.exec(
      changelogChunk
    );
  if (!changelogMatch) {
    console.log(`No changelog found for ${name}`);
    return;
  }
  const changelog = changelogMatch[1];

  const changelogFile = readFileSync(pathTo(`../packages/${name}/CHANGELOG.md`), "utf8");
  const heading = changelogFile.split("\r\n")[0];
  const newChangelogFile = `${heading}\r\n\r\n## Changelog up to version ${version}${changelog}`;

  writeFileSync(pathTo(`../packages/${name}/CHANGELOG.md`), newChangelogFile);

  const newReadme = `${before}## Changelog\n\nSee [CHANGELOG.md](.\\CHANGELOG.md)\n\n${after}`;
  writeFileSync(pathTo(`../packages/${name}/README.md`), newReadme);
});

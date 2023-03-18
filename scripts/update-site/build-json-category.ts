import { writeFile } from "fs";
import { TPackageData, TSize } from ".";
import { r } from "../utils";
import { primitiveTags } from "./tags";

const item: {
  name: string;
  category: string;
  description: string;
  primitives: {
    name: string;
    size: TSize;
  }[];
  tags: string[];
}[] = [];

export const buildJSONCategory = async ({ pkg, name }: { pkg: TPackageData; name: string }) => {
  const { description } = pkg;
  const { list, category, stage } = pkg.primitive;

  const primitives = list.map(item => {
    const { size, name } = item;
    return {
      name,
      size: {
        gzipped: size.gzipped.string,
        minified: size.minified.string,
      },
    } as any;
  });

  const tags = primitiveTags.find(item => item.name === name)?.tags || [];

  item.push({
    name,
    category,
    description,
    primitives,
    tags,
  });
};

export const writeJSONFile = () => {
  const pathToJSONFile = r("../site/src/_generated/primitives.json");
  writeFile(pathToJSONFile, JSON.stringify(item), err => {
    if (err) console.log(err);
  });
};

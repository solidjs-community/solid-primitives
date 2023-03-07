import path from "path";

export const r = (...pathSegments: string[]) => path.resolve(__dirname, ...pathSegments);

const getCommentText = (text: string, marker: "START" | "END") => `<!-- ${text}:${marker} -->`;

export const regexGlobalCaptureGroup = (input: string, regex: RegExp) => {
  const output = [];
  let matches;
  while ((matches = regex.exec(input))) {
    output.push(matches[1]!);
  }
  if (!output.length) return null;
  return output;
};

export function insertTextBetweenComments(file: string, text: string, comment: string): string {
  const startComment = getCommentText(comment, "START");
  const endComment = getCommentText(comment, "END");
  const lines = file.split("\n");
  const start = lines.findIndex(line => line.includes(startComment));
  const end = lines.findIndex(line => line.includes(endComment), start + 1);
  if (start === -1 || end === -1) throw `Could not find ${comment} in ${file}`;
  lines.splice(start + 1, end - start - 1, ...text.split("\n"));
  return lines.join("\n");
}

export function formatBytes(
  bytes: string | number,
  {
    decimals = 2,
    k = 1000,
    sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
  }: {
    decimals?: number;
    sizes?: string[];
    // Some manufacturers, such as Mac, considers kilobyte to be 1000 bytes while others define it as 1024 bytes https://ux.stackexchange.com/a/13850/140158
    k?: 1000 | 1024;
  } = {},
) {
  if (!+bytes) {
    const unit = sizes[0]!;
    const number = 0;

    return {
      string: `${number} ${unit}`,
      number,
      unit,
    };
  }

  const dm = decimals < 0 ? 0 : decimals;

  const i = Math.floor(Math.log(bytes as number) / Math.log(k));
  const number = parseFloat(((bytes as number) / Math.pow(k, i)).toFixed(dm));
  const unit = sizes[i]!;

  return {
    string: `${number} ${unit}`,
    number,
    unit,
  };
}

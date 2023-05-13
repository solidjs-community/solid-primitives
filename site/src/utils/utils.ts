export const kebabCaseToCapitalized = (str: string) => {
  return str
    .split("-")
    .map(word => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
};

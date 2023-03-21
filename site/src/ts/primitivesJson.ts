type TSize = {
  gzipped: string;
  minified: string;
};

export type TPrimitiveJson = {
  name: string;
  category: string;
  description: string;
  primitives: {
    name: string;
    size: TSize;
  }[];
  tags: string[];
}[];

import { getParseFn, Parser } from "./getParseFn";

export type FormError<T> = {
  data: T;
  error: unknown;
};

export type CreateFormOptions<T> = {
  schema?: Parser;
  onSubmit: (data: T) => Promise<void> | void;
  onError: (errors: FormError<T>) => void | Promise<void>;
  castNumbers?: boolean;
};

type FormEvent = Event & {
  submitter: HTMLElement;
} & {
  currentTarget: HTMLFormElement;
  target: Element;
};

// Taken from https://youmightnotneed.com/lodash#set
const set = <T extends object>(obj: T, path: string | string[], value: string | number) => {
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g)!;

  pathArray.reduce((acc, key, i) => {
    if (acc[key] === undefined) acc[key] = {};
    if (i === pathArray.length - 1) acc[key] = value;
    return acc[key];
  }, obj as any);
};

export const createForm = <T>(options: CreateFormOptions<T>) => {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let data: Partial<T> = {};

    for (const [name, value] of formData.entries()) {
      const v = !options.castNumbers || isNaN(value as any) ? value.toString() : Number(value);
      set(data, name, v);
    }

    try {
      if (options.schema) {
        const parser = getParseFn(options.schema);
        await parser(data);
      }
      options.onSubmit(data as T);
    } catch (e) {
      options.onError({ data: data as T, error: e });
    }
  };

  return {
    handleSubmit
  };
};

import set from "lodash.set";
import { z, ZodError } from "zod";

export type FormError<T> = {
  data: T;
  error: ZodError;
};

export type CreateFormOptions<T> = {
  schema: z.AnyZodObject;
  onSubmit: (data: T) => Promise<void> | void;
  onError: (errors: FormError<T>) => void | Promise<void>;
};

type FormEvent = Event & {
  submitter: HTMLElement;
} & {
  currentTarget: HTMLFormElement;
  target: Element;
};

export const createForm = <T>(options: CreateFormOptions<T>) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let data: Partial<T> = {};

    for (const [name, value] of formData.entries()) {
      const v = isNaN(value as any) ? value : Number(value);
      set(data, name, v);
    }

    try {
      options.schema.parse(data);
      options.onSubmit(data as T);
    } catch (e) {
      options.onError({ data: data as T, error: e as ZodError });
    }
  };

  return {
    handleSubmit
  };
};

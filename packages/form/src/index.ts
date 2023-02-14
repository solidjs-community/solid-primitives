import { createStore } from "solid-js/store";

// type FormSubmitEvent = Event & {
//   submitter: HTMLElement;
// } & {
//   currentTarget: HTMLFormElement;
//   target: Element;
// };

// export type FormErrors<F extends object> = { [K in keyof F]: boolean };
// function createErrors<F extends object>(data: F): FormErrors<F> {
//   const values = Object.keys(data) as Array<keyof F>;

//   const errors = values.reduce((acc, val) => {
//     acc[val] = false;
//     return acc;
//   }, {} as Partial<FormErrors<F>>);

//   return errors as FormErrors<F>;
// }

export const createForm = <F extends object>(initialFormData: F) => {
  const [formData, setFormData] = createStore<F>(initialFormData);

  const updateForm = <K extends keyof F>(key: K, value: F[K]): void => {
    setFormData(key as any, value);
  };

  const bulkUpdateForm = (bulkUpdateData: Partial<F>): void => {
    setFormData(val => ({
      ...val,
      ...bulkUpdateData
    }));
  };

  const overrideForm = (overrideData: F): void => {
    setFormData(() => overrideData);
  };

  return {
    formData,
    updateForm,
    bulkUpdateForm,
    overrideForm
  };
};

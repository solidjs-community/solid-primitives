export const scrollIntoView = (
  input: string | Element,
  { offset, behavior }: { offset: number; behavior: "auto" | "smooth" }
) => {
  const el = typeof input === "string" ? document.querySelector(input) : input;
  if (!el) return;

  window.scrollTo({
    behavior,
    top: el!.getBoundingClientRect().top - document.body.getBoundingClientRect().top - offset
  });
};

export const genNodeList = () =>
  Array.from({ length: 10 }, (_, id) => ({
    x: Math.random() * (window.innerWidth - 192),
    y: Math.random() * (window.innerHeight - 192),
    size: Math.random() + 0.15,
    id,
  }));

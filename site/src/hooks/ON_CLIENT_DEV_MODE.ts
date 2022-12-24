import { isServer } from "solid-js/web";

const ON_CLIENT_DEV_MODE = (cb: () => void) => {
  if (isServer || import.meta.env.MODE !== "development") return;
  cb();
};

export default ON_CLIENT_DEV_MODE;

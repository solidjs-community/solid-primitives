import { isServer } from "solid-js/web";

const onPreMount = (cb: () => void) => {
  if (isServer) return;
  cb();
};

export default onPreMount;

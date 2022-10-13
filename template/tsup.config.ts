import { createConfig } from "../../configs/tsup.config";

/*

Toggle additional entries as needed.

`devEntry` will enable creating a separate development module entry.
What goes in and out are decided by use of `process.env.DEV` or `process.env.PROD`.

`ssrEntry` will enable building a server-side entry (for use with SSR frameworks).
What goes in and out are decided by use of `process.env.SSR`.

*/
export default createConfig({
  devEntry: false,
  ssrEntry: true
});

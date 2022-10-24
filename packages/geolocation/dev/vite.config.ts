import { viteConfig } from "../../../configs/vite.config";
import mkcert from "vite-plugin-mkcert";

viteConfig.server = { https: true };
viteConfig.plugins.push(mkcert());

export default viteConfig;

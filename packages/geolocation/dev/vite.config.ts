import { viteConfig } from "../../../configs/vite.config";
import mkcert from "vite-plugin-mkcert";

viteConfig.server = { httos: true };
viteConfig.plugins.push(mkcert());

export default viteConfig;

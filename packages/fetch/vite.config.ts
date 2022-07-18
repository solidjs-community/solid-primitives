import { vitestConfig } from "../../vite.config";

vitestConfig.test!.setupFiles = ['./test/setup.ts'];

export default vitestConfig;

import { vitestConfig } from "../../vite.config";

vitestConfig.test!.deps!.inline!.push(
  "@solid-primitives/event-listener",
  "@solid-primitives/rootless",
  "@solid-primitives/utils"
);

export default vitestConfig;

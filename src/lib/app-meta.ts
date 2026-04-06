import packageJson from "../../package.json";

import { getPublicEnv } from "@/lib/env";

export function getAppMeta() {
  const env = getPublicEnv();

  return {
    version: packageJson.version,
    ...env.server,
  };
}

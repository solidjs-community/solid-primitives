/// <reference types="vite/client" />
/// <reference types="@kobalte/solidbase/types" />

/** Absolute origin of the deployed site (no trailing slash). Defined in vite.config.ts. */
declare const __SITE_ORIGIN__: string;

/** Hash of the OG card source files (scripts/og-version.ts). Defined in vite.config.ts. */
declare const __OG_VERSION__: string;

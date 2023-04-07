/// <reference types="vite/client" />

// declare import.meta.env
interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PROD: "1" | "";
      DEV: "1" | "";
      SSR: "1" | "";
    }
  }
}

export {};

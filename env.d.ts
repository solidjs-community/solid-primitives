declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "production" | "development";
      PROD: "1" | "";
      DEV: "1" | "";
      SSR: "1" | "";
    }
  }
}

export {};

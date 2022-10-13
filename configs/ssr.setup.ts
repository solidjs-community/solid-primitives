/*

For testing the packages in a node environment
(test.environment: "node")

*/

if (typeof window === "undefined") {
  process.env.DEV = "";
  process.env.SSR = "1";
  process.env.PROD = "1";
}

import { createRequire } from "node:module";

const core = await import(new URL("../dist/index.mjs", import.meta.url).href);
const react = await import(new URL("../dist/react.mjs", import.meta.url).href);
const require = createRequire(import.meta.url);
const coreCommonJs = require("../dist/index.cjs");
const reactCommonJs = require("../dist/react.cjs");

if (typeof core.initializeAffinity !== "function") {
  throw new Error("initializeAffinity export is missing");
}
if (typeof react.AffinityProvider !== "function") {
  throw new Error("AffinityProvider export is missing");
}
if (typeof react.PrescriptionComposer !== "function") {
  throw new Error("PrescriptionComposer export is missing");
}
if (typeof coreCommonJs.initializeAffinity !== "function") {
  throw new Error("CommonJS initializeAffinity export is missing");
}
if (typeof reactCommonJs.PrescriptionComposer !== "function") {
  throw new Error("CommonJS PrescriptionComposer export is missing");
}

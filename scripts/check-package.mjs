const core = await import(new URL("../dist/index.mjs", import.meta.url).href);
const react = await import(new URL("../dist/react.mjs", import.meta.url).href);

if (typeof core.initializeAffinity !== "function") {
  throw new Error("initializeAffinity export is missing");
}
if (typeof react.AffinityProvider !== "function") {
  throw new Error("AffinityProvider export is missing");
}
if (typeof react.PrescriptionComposer !== "function") {
  throw new Error("PrescriptionComposer export is missing");
}

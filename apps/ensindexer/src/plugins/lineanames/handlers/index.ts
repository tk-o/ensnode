// @ts-nocheck
export default [
  import("./Registry").then((mod) => mod.default),
  import("./Registrar").then((mod) => mod.default),
  import("./NameWrapper").then((mod) => mod.default),
  import("../../shared/Resolver").then((mod) => mod.default),
];

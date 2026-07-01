import type { IndexingEngineAdapter } from "../../adapter";
import attach_ENSv1RegistryHandlers from "./handlers/ENSv1Registry";
import attach_ENSv2RegistryHandlers from "./handlers/ENSv2Registry";
import attach_ResolverHandlers from "./handlers/Resolver";
import attach_StandaloneReverseRegistrarHandlers from "./handlers/StandaloneReverseRegistrar";
import attach_ThreeDNSTokenHandlers from "./handlers/ThreeDNSToken";
import attach_UpgradeableProxyResolverHandlers from "./handlers/UpgradeableProxyResolver";

export default function (adapter: IndexingEngineAdapter) {
  attach_ENSv1RegistryHandlers(adapter);
  attach_ENSv2RegistryHandlers(adapter);
  attach_ResolverHandlers(adapter);
  attach_StandaloneReverseRegistrarHandlers(adapter);
  attach_UpgradeableProxyResolverHandlers(adapter);
  attach_ThreeDNSTokenHandlers(adapter);
}

import type { IndexingEngineAdapter } from "../../adapter";
import attach_BaseRegistrarHandlers from "./handlers/ensv1/BaseRegistrar";
import attach_ENSv1RegistryHandlers from "./handlers/ensv1/ENSv1Registry";
import attach_NameWrapperHandlers from "./handlers/ensv1/NameWrapper";
import attach_RegistrarControllerHandlers from "./handlers/ensv1/RegistrarController";
import attach_RegistryHandlers from "./handlers/ensv2/ENSv2Registry";
import attach_EnhancedAccessControlHandlers from "./handlers/ensv2/EnhancedAccessControl";
import attach_ETHRegistrarHandlers from "./handlers/ensv2/ETHRegistrar";
import attach_ResolverHandlers from "./handlers/shared/Resolver";

export default function (adapter: IndexingEngineAdapter) {
  attach_BaseRegistrarHandlers(adapter);
  attach_ENSv1RegistryHandlers(adapter);
  attach_NameWrapperHandlers(adapter);
  attach_RegistrarControllerHandlers(adapter);
  attach_EnhancedAccessControlHandlers(adapter);
  attach_RegistryHandlers(adapter);
  attach_ETHRegistrarHandlers(adapter);
  attach_ResolverHandlers(adapter);
}

import type { IndexingEngineAdapter } from "../../../../adapter";
import attach_SharedMultichainResolverHandlers from "../../shared-handlers/multi-chain/Resolver";
import attach_Registrar from "./handlers/Registrar";
import attach_Registry from "./handlers/Registry";

export default function (adapter: IndexingEngineAdapter) {
  attach_Registrar(adapter);
  attach_Registry(adapter);

  attach_SharedMultichainResolverHandlers(adapter);
}

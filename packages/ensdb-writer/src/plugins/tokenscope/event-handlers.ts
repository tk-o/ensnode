import type { IndexingEngineAdapter } from "../../adapter";
import attach_BaseRegistrars from "./handlers/BaseRegistrars";
import attach_NameWrapper from "./handlers/NameWrapper";
import attach_Seaport from "./handlers/Seaport";
import attach_ThreeDNSToken from "./handlers/ThreeDNSToken";

export default function (adapter: IndexingEngineAdapter) {
  attach_BaseRegistrars(adapter);
  attach_NameWrapper(adapter);
  attach_ThreeDNSToken(adapter);
  attach_Seaport(adapter);
}

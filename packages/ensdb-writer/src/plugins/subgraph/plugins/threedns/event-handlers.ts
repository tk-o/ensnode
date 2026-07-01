import type { IndexingEngineAdapter } from "../../../../adapter";
import attach_ThreeDNSResolver from "./handlers/ThreeDNSResolver";
import attach_ThreeDNSToken from "./handlers/ThreeDNSToken";

export default function (adapter: IndexingEngineAdapter) {
  attach_ThreeDNSResolver(adapter);
  attach_ThreeDNSToken(adapter);
}

import type { IndexingEngineAdapter } from "../../adapter";
import attach_AccountMetadata from "./handlers/AccountMetadata";
import attach_ListRecords from "./handlers/ListRecords";
import attach_ListRegistry from "./handlers/ListRegistry";

export default function (adapter: IndexingEngineAdapter) {
  attach_ListRegistry(adapter);
  attach_ListRecords(adapter);
  attach_AccountMetadata(adapter);
}

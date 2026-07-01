import type { IndexingEngineAdapter } from "../../../../adapter";
import {
  handleABIChanged,
  handleAddrChanged,
  handleAddressChanged,
  handleAuthorisationChanged,
  handleContenthashChanged,
  handleDNSRecordChanged,
  handleDNSRecordDeleted,
  handleDNSZonehashChanged,
  handleInterfaceChanged,
  handleNameChanged,
  handlePubkeyChanged,
  handleTextChanged,
  handleVersionChanged,
  handleZoneCreated,
} from "../Resolver";

/**
 * Shared Resolver indexing functions should be registered exactly once, or Ponder will complain about
 * multiple indexing functions being registered for these events. This boolean allows this function
 * to be idempotent — many plugins can call it, but only the first will take effect.
 */
let hasBeenRegistered = false;

/**
 * Registers event handlers with Ponder.
 */
export default function attach_SharedMultichainResolverHandlers(adapter: IndexingEngineAdapter) {
  if (hasBeenRegistered) return;
  hasBeenRegistered = true;

  adapter.on("Resolver:AddrChanged", handleAddrChanged);
  adapter.on("Resolver:AddressChanged", handleAddressChanged);
  adapter.on("Resolver:NameChanged", handleNameChanged);
  adapter.on("Resolver:ABIChanged", handleABIChanged);
  adapter.on("Resolver:PubkeyChanged", handlePubkeyChanged);
  adapter.on(
    "Resolver:TextChanged(bytes32 indexed node, string indexed indexedKey, string key)",
    handleTextChanged,
  );
  adapter.on(
    "Resolver:TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)",
    handleTextChanged,
  );
  adapter.on("Resolver:ContenthashChanged", handleContenthashChanged);
  adapter.on("Resolver:InterfaceChanged", handleInterfaceChanged);
  adapter.on("Resolver:AuthorisationChanged", handleAuthorisationChanged);
  adapter.on("Resolver:VersionChanged", handleVersionChanged);
  // ens-contracts' IDNSRecordResolver#DNSRecordChanged
  // https://github.com/ensdomains/ens-contracts/blob/b6bc1eac9d241b7334ce78a51bacdf272f37fdf5/contracts/resolvers/profiles/IDNSRecordResolver.sol#L6
  adapter.on(
    "Resolver:DNSRecordChanged(bytes32 indexed node, bytes name, uint16 resource, bytes record)",
    handleDNSRecordChanged,
  );
  // NOTE: this DNSRecordChanged ABI spec with the included `ttl` parameter is specific to
  // 3DNS' Resolver implementation, but we include it here for theoretical completeness, were a
  // Resolver indexed by these shared handlers to emit this event.
  adapter.on(
    "Resolver:DNSRecordChanged(bytes32 indexed node, bytes name, uint16 resource, uint32 ttl, bytes record)",
    handleDNSRecordChanged,
  );
  adapter.on("Resolver:DNSRecordDeleted", handleDNSRecordDeleted);
  adapter.on("Resolver:DNSZonehashChanged", handleDNSZonehashChanged);
  adapter.on("Resolver:ZoneCreated", handleZoneCreated);
}

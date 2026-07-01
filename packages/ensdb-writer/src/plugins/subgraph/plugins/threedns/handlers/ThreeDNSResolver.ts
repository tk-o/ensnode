import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../../../adapter";
import { namespaceContract } from "../../../../../lib/namespace-contract";
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
} from "../../../shared-handlers/Resolver";

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.ThreeDNS;

  adapter.on(namespaceContract(pluginName, "Resolver:AddrChanged"), handleAddrChanged);
  adapter.on(namespaceContract(pluginName, "Resolver:AddressChanged"), handleAddressChanged);
  adapter.on(namespaceContract(pluginName, "Resolver:NameChanged"), handleNameChanged);
  adapter.on(namespaceContract(pluginName, "Resolver:ABIChanged"), handleABIChanged);
  adapter.on(namespaceContract(pluginName, "Resolver:PubkeyChanged"), handlePubkeyChanged);
  adapter.on(
    namespaceContract(
      pluginName,
      "Resolver:TextChanged(bytes32 indexed node, string indexed indexedKey, string key)",
    ),
    handleTextChanged,
  );
  adapter.on(
    namespaceContract(
      pluginName,
      "Resolver:TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)",
    ),
    handleTextChanged,
  );
  adapter.on(
    namespaceContract(pluginName, "Resolver:ContenthashChanged"),
    handleContenthashChanged,
  );
  adapter.on(namespaceContract(pluginName, "Resolver:InterfaceChanged"), handleInterfaceChanged);
  adapter.on(
    namespaceContract(pluginName, "Resolver:AuthorisationChanged"),
    handleAuthorisationChanged,
  );
  adapter.on(namespaceContract(pluginName, "Resolver:VersionChanged"), handleVersionChanged);
  // NOTE: 3DNS' Resolver contract only emits DNSRecordChanged with the included `ttl` argument
  // and we explicitly do not index ens-contracts' IDNSRecordResolver#DNSRecordChanged (without the `ttl`)
  // in this file, as these handlers are 3DNS-specific
  adapter.on(
    namespaceContract(
      pluginName,
      "Resolver:DNSRecordChanged(bytes32 indexed node, bytes name, uint16 resource, uint32 ttl, bytes record)",
    ),
    handleDNSRecordChanged,
  );
  adapter.on(namespaceContract(pluginName, "Resolver:DNSRecordDeleted"), handleDNSRecordDeleted);
  adapter.on(
    namespaceContract(pluginName, "Resolver:DNSZonehashChanged"),
    handleDNSZonehashChanged,
  );
  adapter.on(namespaceContract(pluginName, "Resolver:ZoneCreated"), handleZoneCreated);
}

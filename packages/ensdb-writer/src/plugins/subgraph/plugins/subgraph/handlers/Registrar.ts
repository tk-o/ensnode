import { interpretTokenIdAsLabelHash } from "enssdk";

import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../../../adapter";
import { namespaceContract } from "../../../../../lib/namespace-contract";
import { makeRegistrarHandlers } from "../../../shared-handlers/Registrar";

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.Subgraph;

  const {
    handleNameRegistered,
    handleNameRegisteredByController,
    handleNameRenewedByController,
    handleNameRenewed,
    handleNameTransferred,
  } = makeRegistrarHandlers({ pluginName });

  ///////////////////////////////
  // BaseRegistrar
  // https://docs.ens.domains/registry/eth/#baseregistrar-vs-controller
  ///////////////////////////////

  adapter.on(
    namespaceContract(pluginName, "BaseRegistrar:NameRegistered"),
    async ({ context, event }) => {
      await handleNameRegistered({
        context,
        event: {
          ...event,
          args: {
            ...event.args,
            labelHash: interpretTokenIdAsLabelHash(event.args.id),
          },
        },
      });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "BaseRegistrar:NameRenewed"),
    async ({ context, event }) => {
      await handleNameRenewed({
        context,
        event: {
          ...event,
          args: {
            ...event.args,
            labelHash: interpretTokenIdAsLabelHash(event.args.id),
          },
        },
      });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "BaseRegistrar:Transfer"),
    async ({ context, event }) => {
      const { tokenId, from, to } = event.args;
      await handleNameTransferred({
        context,
        event: {
          ...event,
          args: {
            from,
            to,
            labelHash: interpretTokenIdAsLabelHash(tokenId),
          },
        },
      });
    },
  );

  /**
   * NameRegistered (yes base cost, no premium, no referral)
   * - LegacyEthRegistrarController
   *
   * `name`/`label` params are misnamed onchain — re-map to proper ENS terminology.
   */
  adapter.on(
    namespaceContract(
      pluginName,
      "RegistrarController:NameRegistered(string name, bytes32 indexed label, address indexed owner, uint256 cost, uint256 expires)",
    ),
    async ({ context, event }) => {
      await handleNameRegisteredByController({
        context,
        event: {
          ...event,
          args: {
            ...event.args,
            label: event.args.name,
            labelHash: event.args.label,
          },
        },
      });
    },
  );

  /**
   * NameRegistered (yes base cost, yes premium, no referral)
   * - WrappedEthRegistrarController
   *
   * `name`/`label` params are misnamed onchain — re-map to proper ENS terminology.
   * `cost` = baseCost + premium.
   */
  adapter.on(
    namespaceContract(
      pluginName,
      "RegistrarController:NameRegistered(string name, bytes32 indexed label, address indexed owner, uint256 baseCost, uint256 premium, uint256 expires)",
    ),
    async ({ context, event }) => {
      await handleNameRegisteredByController({
        context,
        event: {
          ...event,
          args: {
            label: event.args.name,
            labelHash: event.args.label,
            cost: event.args.baseCost + event.args.premium,
          },
        },
      });
    },
  );

  /**
   * NameRegistered (yes base cost, yes premium, yes referral)
   * - UnwrappedEthRegistrarController
   *
   * `cost` = baseCost + premium.
   */
  adapter.on(
    namespaceContract(
      pluginName,
      "RegistrarController:NameRegistered(string label, bytes32 indexed labelhash, address indexed owner, uint256 baseCost, uint256 premium, uint256 expires, bytes32 referrer)",
    ),
    async ({ context, event }) => {
      await handleNameRegisteredByController({
        context,
        event: {
          ...event,
          args: {
            label: event.args.label,
            labelHash: event.args.labelhash,
            cost: event.args.baseCost + event.args.premium,
          },
        },
      });
    },
  );

  /**
   * NameRenewed (yes base cost, no premium, no referral)
   * - LegacyEthRegistrarController
   * - WrappedEthRegistrarController
   *
   * `name`/`label` params are misnamed onchain — re-map to proper ENS terminology.
   */
  adapter.on(
    namespaceContract(
      pluginName,
      "RegistrarController:NameRenewed(string name, bytes32 indexed label, uint256 cost, uint256 expires)",
    ),
    async ({ context, event }) => {
      await handleNameRenewedByController({
        context,
        event: {
          ...event,
          args: {
            ...event.args,
            label: event.args.name,
            labelHash: event.args.label,
          },
        },
      });
    },
  );

  /**
   * NameRenewed (yes base cost, no premium, yes referral)
   * - UnwrappedEthRegistrarController
   */
  adapter.on(
    namespaceContract(
      pluginName,
      "RegistrarController:NameRenewed(string label, bytes32 indexed labelhash, uint256 cost, uint256 expires, bytes32 referrer)",
    ),
    async ({ context, event }) => {
      await handleNameRenewedByController({
        context,
        event: {
          ...event,
          args: {
            ...event.args,
            label: event.args.label,
            labelHash: event.args.labelhash,
          },
        },
      });
    },
  );
}

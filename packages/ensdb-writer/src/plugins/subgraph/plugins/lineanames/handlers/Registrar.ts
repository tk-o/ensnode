import { interpretTokenIdAsLabelHash } from "enssdk";

import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../../../adapter";
import { namespaceContract } from "../../../../../lib/namespace-contract";
import { makeRegistrarHandlers } from "../../../shared-handlers/Registrar";

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.Lineanames;

  const {
    handleNameRegistered,
    handleNameRegisteredByController,
    handleNameRenewedByController,
    handleNameRenewed,
    handleNameTransferred,
  } = makeRegistrarHandlers({ pluginName });

  adapter.on(
    namespaceContract(pluginName, "BaseRegistrar:NameRegistered"),
    async ({ context, event }) => {
      await handleNameRegistered({
        context,
        event: {
          ...event,
          args: { ...event.args, labelHash: interpretTokenIdAsLabelHash(event.args.id) },
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
          args: { ...event.args, labelHash: interpretTokenIdAsLabelHash(event.args.id) },
        },
      });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "BaseRegistrar:Transfer"),
    async ({ context, event }) => {
      await handleNameTransferred({
        context,
        event: {
          ...event,
          args: { ...event.args, labelHash: interpretTokenIdAsLabelHash(event.args.tokenId) },
        },
      });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "EthRegistrarController:OwnerNameRegistered"),
    async ({ context, event }) => {
      await handleNameRegisteredByController({
        context,
        event: {
          ...event,
          args: {
            // EthRegistrarController incorrectly names its event arguments, so we re-map them here
            label: event.args.name,
            labelHash: event.args.label,
            // Linea allows the owner of the EthRegistrarController to register subnames for free
            cost: 0n,
          },
        },
      });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "EthRegistrarController:PohNameRegistered"),
    async ({ context, event }) => {
      await handleNameRegisteredByController({
        context,
        event: {
          ...event,
          args: {
            // EthRegistrarController incorrectly names its event arguments, so we re-map them here
            label: event.args.name,
            labelHash: event.args.label,
            // Linea allows any wallet address holding a Proof of Humanity (Poh) to register one subname for free
            cost: 0n,
          },
        },
      });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "EthRegistrarController:NameRegistered"),
    async ({ context, event }) => {
      await handleNameRegisteredByController({
        context,
        event: {
          ...event,
          args: {
            // EthRegistrarController incorrectly names its event arguments, so we re-map them here
            label: event.args.name,
            labelHash: event.args.label,
            // the new registrar controller uses baseCost + premium to compute cost
            cost: event.args.baseCost + event.args.premium,
          },
        },
      });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "EthRegistrarController:NameRenewed"),
    async ({ context, event }) => {
      await handleNameRenewedByController({
        context,
        event: {
          ...event,
          args: {
            ...event.args,
            // EthRegistrarController incorrectly names its event arguments, so we re-map them here
            label: event.args.name,
            labelHash: event.args.label,
          },
        },
      });
    },
  );
}

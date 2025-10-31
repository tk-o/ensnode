import config from "@/config";

import { ponder } from "ponder:registry";
import { namehash } from "viem/ens";

import { makeSubdomainNode, PluginName, RegistrarEventNames } from "@ensnode/ensnode-sdk";

import { namespaceContract } from "@/lib/plugin-helpers";

import {
  handleControllerAddedToRegistrar,
  handleControllerRemovedFromRegistrar,
  handleRegistration,
  handleRenewal,
} from "../../shared/lib/handle-registrar-events";
import { getRegistrarManagedName, tokenIdToLabelHash } from "../lib/registrar-helpers";

/**
 * Registers event handlers with Ponder.
 */
export default function () {
  const pluginName = PluginName.Registrars;
  const parentNode = namehash(getRegistrarManagedName(config.namespace));

  ponder.on(
    namespaceContract(pluginName, "LineaEth_BaseRegistrar:ControllerAdded"),
    async ({ context, event }) => {
      await handleControllerAddedToRegistrar(
        context,
        {
          id: event.id,
          name: RegistrarEventNames.ControllerAdded,
          chainId: context.chain.id,
          blockRef: {
            number: Number(event.block.number),
            timestamp: Number(event.block.timestamp),
          },
          contractAddress: event.log.address,
          transactionHash: event.transaction.hash,
          logIndex: event.log.logIndex,
        },
        {
          chainId: context.chain.id,
          controllerAddress: event.args.controller,
          registrarAddress: event.log.address,
        },
      );
    },
  );

  ponder.on(
    namespaceContract(pluginName, "LineaEth_BaseRegistrar:ControllerRemoved"),
    async ({ context, event }) => {
      await handleControllerRemovedFromRegistrar(
        context,
        {
          id: event.id,
          name: RegistrarEventNames.ControllerRemoved,
          chainId: context.chain.id,
          blockRef: {
            number: Number(event.block.number),
            timestamp: Number(event.block.timestamp),
          },
          contractAddress: event.log.address,
          transactionHash: event.transaction.hash,
          logIndex: event.log.logIndex,
        },
        {
          chainId: context.chain.id,
          controllerAddress: event.args.controller,
        },
      );
    },
  );

  ponder.on(
    namespaceContract(pluginName, "LineaEth_BaseRegistrar:NameRegistered"),
    async ({ context, event }) => {
      const labelHash = tokenIdToLabelHash(event.args.id);
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = Number(event.args.expires);

      await handleRegistration(
        context,
        {
          id: event.id,
          name: RegistrarEventNames.NameRegistered,
          chainId: context.chain.id,
          blockRef: {
            number: Number(event.block.number),
            timestamp: Number(event.block.timestamp),
          },
          contractAddress: event.log.address,
          transactionHash: event.transaction.hash,
          logIndex: event.log.logIndex,
        },
        {
          node,
          parentNode,
          expiresAt,
        },
      );
    },
  );

  ponder.on(
    namespaceContract(pluginName, "LineaEth_BaseRegistrar:NameRenewed"),
    async ({ context, event }) => {
      const labelHash = tokenIdToLabelHash(event.args.id);
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = Number(event.args.expires);

      await handleRenewal(
        context,
        {
          id: event.id,
          name: RegistrarEventNames.NameRenewed,
          chainId: context.chain.id,
          blockRef: {
            number: Number(event.block.number),
            timestamp: Number(event.block.timestamp),
          },
          contractAddress: event.log.address,
          transactionHash: event.transaction.hash,
          logIndex: event.log.logIndex,
        },
        {
          node,
          expiresAt,
        },
      );
    },
  );
}

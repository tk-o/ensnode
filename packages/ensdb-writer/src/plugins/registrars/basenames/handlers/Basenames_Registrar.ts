import { interpretTokenIdAsLabelHash, makeSubdomainNode } from "enssdk";

import { type BlockRef, bigIntToNumber, PluginName, type Subregistry } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../../adapter";
import { getThisAccountId } from "../../../../lib/get-this-account-id";
import { getManagedName } from "../../../../lib/managed-names";
import { namespaceContract } from "../../../../lib/namespace-contract";
import {
  handleRegistrarEventRegistration,
  handleRegistrarEventRenewal,
} from "../../shared/lib/registrar-events";
import { upsertSubregistry } from "../../shared/lib/subregistry";

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.Registrars;

  // support NameRegisteredWithRecord for BaseRegistrar as it used by Base's RegistrarControllers
  adapter.on(
    namespaceContract(pluginName, "Basenames_BaseRegistrar:NameRegisteredWithRecord"),
    async ({ context, event }) => {
      const id = event.id;

      const subregistryId = getThisAccountId(context, event);
      const { node: managedNode } = getManagedName(context.namespace, subregistryId);
      const subregistry = { subregistryId, node: managedNode } satisfies Subregistry;

      const labelHash = interpretTokenIdAsLabelHash(event.args.id);
      const node = makeSubdomainNode(labelHash, managedNode);
      const registrant = event.transaction.from;
      const expiresAt = bigIntToNumber(event.args.expires);
      const block = {
        number: bigIntToNumber(event.block.number),
        timestamp: bigIntToNumber(event.block.timestamp),
      } satisfies BlockRef;
      const transactionHash = event.transaction.hash;

      await upsertSubregistry(context, subregistry);

      await handleRegistrarEventRegistration(context, {
        id,
        subregistryId,
        node,
        registrant,
        expiresAt,
        block,
        transactionHash,
      });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "Basenames_BaseRegistrar:NameRegistered"),
    async ({ context, event }) => {
      const id = event.id;

      const subregistryId = getThisAccountId(context, event);
      const { node: managedNode } = getManagedName(context.namespace, subregistryId);
      const subregistry = { subregistryId, node: managedNode } satisfies Subregistry;

      const labelHash = interpretTokenIdAsLabelHash(event.args.id);
      const node = makeSubdomainNode(labelHash, managedNode);
      const registrant = event.transaction.from;
      const expiresAt = bigIntToNumber(event.args.expires);
      const block = {
        number: bigIntToNumber(event.block.number),
        timestamp: bigIntToNumber(event.block.timestamp),
      } satisfies BlockRef;
      const transactionHash = event.transaction.hash;

      await upsertSubregistry(context, subregistry);

      await handleRegistrarEventRegistration(context, {
        id,
        subregistryId,
        node,
        registrant,
        expiresAt,
        block,
        transactionHash,
      });
    },
  );

  adapter.on(
    namespaceContract(pluginName, "Basenames_BaseRegistrar:NameRenewed"),
    async ({ context, event }) => {
      const id = event.id;

      const subregistryId = getThisAccountId(context, event);
      const { node: managedNode } = getManagedName(context.namespace, subregistryId);

      const labelHash = interpretTokenIdAsLabelHash(event.args.id);
      const node = makeSubdomainNode(labelHash, managedNode);
      const registrant = event.transaction.from;
      const expiresAt = bigIntToNumber(event.args.expires);
      const block = {
        number: bigIntToNumber(event.block.number),
        timestamp: bigIntToNumber(event.block.timestamp),
      } satisfies BlockRef;
      const transactionHash = event.transaction.hash;

      await handleRegistrarEventRenewal(context, {
        id,
        subregistryId,
        node,
        registrant,
        expiresAt,
        block,
        transactionHash,
      });
    },
  );
}

import { ponder } from "ponder:registry";

import { namespaceContract } from "@/lib/plugin-helpers";
import { handleRegistrarAction } from "@/lib/registrar-actions-helpers";
import { ETH_NODE, PluginName, RegistrarActionType, makeSubdomainNode } from "@ensnode/ensnode-sdk";
import { hexToBytes, zeroHash } from "viem";

/**
 * Registers event handlers with Ponder.
 */
export default function () {
  const pluginName = PluginName.SubRegistry;

  ponder.on(
    namespaceContract(pluginName, "UnwrappedEthRegistrarController:NameRegistered"),
    async ({ context, event }) => {
      await handleRegistrarAction(context, event, {
        type: RegistrarActionType.Registration,

        // NOTE: UnwrappedEthRegistrarController emits the labelHash of the name under '.eth'
        node: makeSubdomainNode(event.args.labelhash, ETH_NODE),

        expiresAt: event.args.expires,

        baseCost: event.args.baseCost,
        premium: event.args.premium,

        // NOTE: transaction sender pays for the name registration,
        // so we treat the transaction sender address as a registrant
        registrant: event.transaction.from,

        rawReferrer: hexToBytes(event.args.referrer),
      });
    },
  );

  ponder.on(
    namespaceContract(pluginName, "UnwrappedEthRegistrarController:NameRenewed"),
    async ({ context, event }) => {
      await handleRegistrarAction(context, event, {
        type: RegistrarActionType.Renewal,

        // NOTE: UnwrappedEthRegistrarController emits the labelHash of the name under '.eth'
        node: makeSubdomainNode(event.args.labelhash, ETH_NODE),

        expiresAt: event.args.expires,

        baseCost: event.args.cost,
        premium: 0n,

        // NOTE: transaction sender pays for the name renewal,
        // so we treat the transaction sender address as a registrant
        registrant: event.transaction.from,

        rawReferrer: hexToBytes(event.args.referrer),
      });
    },
  );
}

import { ponder } from "ponder:registry";

import {
  CurrencyIds,
  LINEANAMES_NODE,
  makeSubdomainNode,
  PluginName,
  RegistrarActionTypes,
  ZERO_REFERRER_ENCODED,
} from "@ensnode/ensnode-sdk";

import { namespaceContract } from "@/lib/plugin-helpers";
import {
  buildSubregistryRegistrarAction,
  getIncrementalDurationForRegistration,
  getIncrementalDurationForRenewal,
} from "@/lib/subregistry/registrar-action";

import { getCurrentRegistration } from "../../../shared/lib/get-current-registration";
import { handleRegistrarAction } from "../../../shared/lib/handle-registrar-action";

/**
 * Registers event handlers with Ponder.
 */
export default function () {
  const pluginName = PluginName.Subregistry;
  const parentNode = LINEANAMES_NODE;
  /**
   * No Registrar Controller event includes a referrer.
   */
  const encodedReferrer = ZERO_REFERRER_ENCODED;

  /**
   * LineaEth_EthRegistrarController Event Handlers
   */

  ponder.on(
    namespaceContract(pluginName, "LineaEth_EthRegistrarController:NameRegistered"),
    async ({ context, event }) => {
      const timestamp = event.block.timestamp;
      const type = RegistrarActionTypes.Registration;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
      const baseCost = event.args.baseCost;
      const premium = event.args.premium;
      /**
       * Transaction sender pays for the name registration,
       * so we treat the transaction sender address as a registrant
       */
      const registrant = event.transaction.from;

      // Get incremental duration for Registration Action
      const incrementalDuration = getIncrementalDurationForRegistration(
        Number(expiresAt),
        Number(timestamp),
      );

      const registrarAction = buildSubregistryRegistrarAction(
        {
          chainId: context.chain.id,
          timestamp: event.block.timestamp,
          transactionHash: event.transaction.hash,
          logIndex: event.log.logIndex,
        },
        {
          type,
          node,
          expiresAt,
          baseCost,
          premium,
          incrementalDuration,
          registrant,
          encodedReferrer,
        },
        CurrencyIds.ETH,
      );

      await handleRegistrarAction(context, event, registrarAction);
    },
  );

  ponder.on(
    namespaceContract(pluginName, "LineaEth_EthRegistrarController:NameRenewed"),
    async ({ context, event }) => {
      const type = RegistrarActionTypes.Renewal;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
      const baseCost = event.args.cost;
      /**
       * Premium is always zero for renewals.
       */
      const premium = 0n;
      /**
       * Transaction sender pays for the name renewal,
       * so we treat the transaction sender address as a registrant
       */
      const registrant = event.transaction.from;

      const currentRegistration = await getCurrentRegistration(context, node);

      // Get incremental duration for Renewal Action
      const incrementalDuration = getIncrementalDurationForRenewal(
        Number(expiresAt),
        currentRegistration,
      );

      const registrarAction = buildSubregistryRegistrarAction(
        {
          chainId: context.chain.id,
          timestamp: event.block.timestamp,
          transactionHash: event.transaction.hash,
          logIndex: event.log.logIndex,
        },
        {
          type,
          node,
          expiresAt,
          baseCost,
          premium,
          incrementalDuration,
          registrant,
          encodedReferrer,
        },
        CurrencyIds.ETH,
      );

      await handleRegistrarAction(context, event, registrarAction);
    },
  );
}

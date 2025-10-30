import config from "@/config";

import { ponder } from "ponder:registry";
import { namehash } from "viem/ens";

import {
  CurrencyIds,
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
} from "@/lib/registrars/registrar-action";

import { getCurrentRegistration } from "../../shared/lib/get-current-registration";
import { handleRegistrarAction } from "../../shared/lib/handle-registrar-action";
import { getRegistrarManagedName } from "../lib/registrar-helpers";

/**
 * Registers event handlers with Ponder.
 */
export default function () {
  const pluginName = PluginName.Registrars;
  const parentNode = namehash(getRegistrarManagedName(config.namespace));
  /**
   * No Registrar Controller event includes a referrer.
   */
  const encodedReferrer = ZERO_REFERRER_ENCODED;
  /**
   * No Registrar Controller event includes a base cost.
   */
  const baseCost = 0n;
  /**
   * No Registrar Controller event includes a premium.
   */
  const premium = 0n;

  /**
   * BaseEth_EARegistrarController Event Handlers
   */

  ponder.on(
    namespaceContract(pluginName, "BaseEth_EARegistrarController:NameRegistered"),
    async ({ context, event }) => {
      const timestamp = event.block.timestamp;
      const type = RegistrarActionTypes.Registration;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
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

  /**
   * BaseEth_RegistrarController Event Handlers
   */

  ponder.on(
    namespaceContract(pluginName, "BaseEth_RegistrarController:NameRegistered"),
    async ({ context, event }) => {
      const timestamp = event.block.timestamp;
      const type = RegistrarActionTypes.Registration;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
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
    namespaceContract(pluginName, "BaseEth_RegistrarController:NameRenewed"),
    async ({ context, event }) => {
      const type = RegistrarActionTypes.Renewal;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
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

  /**
   * BaseEth_UpgradeableRegistrarController Event Handlers
   */

  ponder.on(
    namespaceContract(pluginName, "BaseEth_UpgradeableRegistrarController:NameRegistered"),
    async ({ context, event }) => {
      const timestamp = event.block.timestamp;
      const type = RegistrarActionTypes.Registration;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
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
    namespaceContract(pluginName, "BaseEth_UpgradeableRegistrarController:NameRenewed"),
    async ({ context, event }) => {
      const type = RegistrarActionTypes.Renewal;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
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

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

import { getCurrentRegistration } from "../../../shared/lib/get-current-registration";
import { handleRegistrarAction } from "../../../shared/lib/handle-registrar-action";
import { getRegistrarManagedName } from "../lib/registrar-helpers";

/**
 * Registers event handlers with Ponder.
 */
export default function () {
  const pluginName = PluginName.Registrars;
  const parentNode = namehash(getRegistrarManagedName(config.namespace));

  /**
   * Eth_LegacyEthRegistrarController Event Handlers
   */

  ponder.on(
    namespaceContract(pluginName, "Eth_LegacyEthRegistrarController:NameRegistered"),
    async ({ context, event }) => {
      const timestamp = event.block.timestamp;
      const type = RegistrarActionTypes.Registration;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
      const baseCost = event.args.cost;
      /**
       * Eth_LegacyEthRegistrarController does not emit a premium
       * in the NameRegistered event.
       */
      const premium = 0n;
      /**
       * Transaction sender pays for the name registration,
       * so we treat the transaction sender address as a registrant
       */
      const registrant = event.transaction.from;
      /**
       * Eth_LegacyEthRegistrarController does not emit a referrer in
       * the NameRegistered event.
       */
      const encodedReferrer = ZERO_REFERRER_ENCODED;

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
    namespaceContract(pluginName, "Eth_LegacyEthRegistrarController:NameRenewed"),
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
      /**
       * Eth_LegacyEthRegistrarController does not emit a referrer in
       * the NameRenewed event.
       */
      const encodedReferrer = ZERO_REFERRER_ENCODED;

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
   * Eth_WrappedEthRegistrarController Event Handlers
   */

  ponder.on(
    namespaceContract(pluginName, "Eth_WrappedEthRegistrarController:NameRegistered"),
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
      /**
       * Eth_WrappedEthRegistrarController does not emit a referrer in
       * the NameRegistered event.
       */
      const encodedReferrer = ZERO_REFERRER_ENCODED;

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
    namespaceContract(pluginName, "Eth_WrappedEthRegistrarController:NameRenewed"),
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
      /**
       * Eth_WrappedEthRegistrarController does not emit a referrer in
       * the NameRenewed event.
       */
      const encodedReferrer = ZERO_REFERRER_ENCODED;

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
   * Eth_UnwrappedEthRegistrarController Event Handlers
   */

  ponder.on(
    namespaceContract(pluginName, "Eth_UnwrappedEthRegistrarController:NameRegistered"),
    async ({ context, event }) => {
      const timestamp = event.block.timestamp;
      const type = RegistrarActionTypes.Registration;
      const labelHash = event.args.labelhash;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
      const baseCost = event.args.baseCost;
      const premium = event.args.premium;
      /**
       * Transaction sender pays for the name registration,
       * so we treat the transaction sender address as a registrant
       */
      const registrant = event.transaction.from;
      const encodedReferrer = event.args.referrer;

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
    namespaceContract(pluginName, "Eth_UnwrappedEthRegistrarController:NameRenewed"),
    async ({ context, event }) => {
      const type = RegistrarActionTypes.Renewal;
      const labelHash = event.args.labelhash;
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
      const encodedReferrer = event.args.referrer;

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

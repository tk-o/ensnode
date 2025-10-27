import config from "@/config";

import { ponder } from "ponder:registry";
import { namehash } from "viem/ens";

import {
  CurrencyIds,
  makeSubdomainNode,
  PluginName,
  RegistrarActionType,
  ZERO_RAW_REFERRER,
} from "@ensnode/ensnode-sdk";

import { namespaceContract } from "@/lib/plugin-helpers";
import { handleRegistrarAction } from "@/lib/registrar-actions-helpers";

import { getRegistrarManagedName } from "../lib/registrar-helpers";

/**
 * Registers event handlers with Ponder.
 */
export default function () {
  const pluginName = PluginName.Subregistry;
  const parentNode = namehash(getRegistrarManagedName(config.namespace));
  /**
   * No Registrar Controller event includes a referrer.
   */
  const encodedReferrer = ZERO_RAW_REFERRER;
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
      const type = RegistrarActionType.Registration;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
      /**
       * Transaction sender pays for the name registration,
       * so we treat the transaction sender address as a registrant
       */
      const registrant = event.transaction.from;

      await handleRegistrarAction(context, event, {
        type,
        node,
        expiresAt,
        baseCost: {
          currency: CurrencyIds.ETH,
          amount: baseCost,
        },
        premium: {
          currency: CurrencyIds.ETH,
          amount: premium,
        },
        registrant,
        encodedReferrer,
      });
    },
  );

  /**
   * BaseEth_RegistrarController Event Handlers
   */

  ponder.on(
    namespaceContract(pluginName, "BaseEth_RegistrarController:NameRegistered"),
    async ({ context, event }) => {
      const type = RegistrarActionType.Registration;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
      /**
       * Transaction sender pays for the name registration,
       * so we treat the transaction sender address as a registrant
       */
      const registrant = event.transaction.from;
      /**
       * BaseEth_RegistrarController does not emit a referrer in
       * the NameRegistered event.
       */

      await handleRegistrarAction(context, event, {
        type,
        node,
        expiresAt,
        baseCost: {
          currency: CurrencyIds.ETH,
          amount: baseCost,
        },
        premium: {
          currency: CurrencyIds.ETH,
          amount: premium,
        },
        registrant,
        encodedReferrer,
      });
    },
  );

  ponder.on(
    namespaceContract(pluginName, "BaseEth_RegistrarController:NameRenewed"),
    async ({ context, event }) => {
      const type = RegistrarActionType.Renewal;
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

      await handleRegistrarAction(context, event, {
        type,
        node,
        expiresAt,
        baseCost: {
          currency: CurrencyIds.ETH,
          amount: baseCost,
        },
        premium: {
          currency: CurrencyIds.ETH,
          amount: premium,
        },
        registrant,
        encodedReferrer,
      });
    },
  );

  /**
   * BaseEth_UpgradeableRegistrarController Event Handlers
   */

  ponder.on(
    namespaceContract(pluginName, "BaseEth_UpgradeableRegistrarController:NameRegistered"),
    async ({ context, event }) => {
      const type = RegistrarActionType.Registration;
      const labelHash = event.args.label;
      const node = makeSubdomainNode(labelHash, parentNode);
      const expiresAt = event.args.expires;
      /**
       * Transaction sender pays for the name registration,
       * so we treat the transaction sender address as a registrant
       */
      const registrant = event.transaction.from;

      await handleRegistrarAction(context, event, {
        type,
        node,
        expiresAt,
        baseCost: {
          currency: CurrencyIds.ETH,
          amount: baseCost,
        },
        premium: {
          currency: CurrencyIds.ETH,
          amount: premium,
        },
        registrant,
        encodedReferrer,
      });
    },
  );

  ponder.on(
    namespaceContract(pluginName, "BaseEth_UpgradeableRegistrarController:NameRenewed"),
    async ({ context, event }) => {
      const type = RegistrarActionType.Renewal;
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

      await handleRegistrarAction(context, event, {
        type,
        node,
        expiresAt,
        baseCost: {
          currency: CurrencyIds.ETH,
          amount: baseCost,
        },
        premium: {
          currency: CurrencyIds.ETH,
          amount: premium,
        },
        registrant,
        encodedReferrer,
      });
    },
  );
}

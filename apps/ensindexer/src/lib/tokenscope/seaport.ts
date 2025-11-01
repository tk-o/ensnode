import type { ENSNamespaceId } from "@ensnode/datasources";
import { type ChainId, CurrencyIds, uniq } from "@ensnode/ensnode-sdk";

import { getCurrencyIdForContract } from "@/lib/currencies";
import { type AssetNamespace, AssetNamespaces } from "@/lib/tokenscope/assets";
import { getSupportedNFTIssuer } from "@/lib/tokenscope/nft-issuers";
import type { SupportedPayment, SupportedSale } from "@/lib/tokenscope/sales";
import {
  type ConsiderationItem,
  ItemType,
  type OfferItem,
  type OrderFulfilledEvent,
} from "@/lib/tokenscope/seaport-types";

import type { SupportedNFT } from "./assets";

/**
 * Gets the supported TokenScope Asset Namespace for a given Seaport ItemType.
 *
 * @param itemType - The Seaport item type to get the supported TokenScope asset namespace for
 * @returns the supported TokenScope Asset Namespace for the given Seaport ItemType, or null
 *          if the Seaport item type is not supported.
 */
const getAssetNamespace = (itemType: ItemType): AssetNamespace | null => {
  switch (itemType) {
    case ItemType.ERC721:
      return AssetNamespaces.ERC721;
    case ItemType.ERC1155:
      return AssetNamespaces.ERC1155;
    default:
      return null;
  }
};

/**
 * Gets the supported NFT from a given Seaport item.
 *
 * @param namespaceId - The ENSNamespace identifier (e.g. 'mainnet', 'sepolia', 'holesky',
 *  'ens-test-env')
 * @param chainId - The chain ID of the Seaport item
 * @param item - The Seaport item to get the supported NFT from
 * @returns the supported NFT from the given Seaport item, or `null` if the Seaport item is
 *          not a supported NFT
 */
const getSupportedNFT = (
  namespaceId: ENSNamespaceId,
  chainId: ChainId,
  item: OfferItem | ConsiderationItem,
): SupportedNFT | null => {
  // validate amount as exactly 1 item.
  // All SupportedNFTs (including ERC1155) must never have a balance or amount > 1.
  if (item.amount !== 1n) return null;

  // validate item as an ERC721/ERC1155 NFT
  const assetNamespace = getAssetNamespace(item.itemType);
  if (!assetNamespace) return null;

  // validate that the token is from a SupportedNFTIssuer contract
  const nftIssuer = getSupportedNFTIssuer(namespaceId, {
    chainId,
    address: item.token,
  });
  if (!nftIssuer) return null;

  // validate that the token is from the correct asset namespace
  if (nftIssuer.assetNamespace !== assetNamespace) return null;

  const contract = nftIssuer.contract;
  const tokenId = item.identifier;
  const domainId = nftIssuer.getDomainId(tokenId);

  return {
    assetNamespace,
    contract,
    tokenId,
    domainId,
  };
};

const getSupportedPayment = (
  chainId: ChainId,
  item: OfferItem | ConsiderationItem,
): SupportedPayment | null => {
  // only NATIVE and ERC20 Payments are supported at the moment
  if (item.itemType !== ItemType.NATIVE && item.itemType !== ItemType.ERC20) return null;

  // validate that the item is a supported currency
  const currencyId = getCurrencyIdForContract({ chainId, address: item.token });
  if (!currencyId) return null;

  // Sanity Check: if ItemType.NATIVE, the inferred Currency must be ETH
  if (item.itemType === ItemType.NATIVE && currencyId !== CurrencyIds.ETH) return null;

  // Sanity Check: if ItemType.ERC20, the inferred Currency must NOT be ETH
  if (item.itemType === ItemType.ERC20 && currencyId === CurrencyIds.ETH) return null;

  // Sanity Check: amount of currency must be >=0
  if (item.amount < 0n) return null;

  // finally, a valid, SupportedPayment
  return {
    price: {
      currency: currencyId,
      amount: item.amount,
    },
  };
};

interface SeaportItemExtractions {
  nfts: SupportedNFT[];

  /**
   * Seaport supports multiple payments in a single order.
   *
   * Example cases include:
   * - Payments are being made in multiple currencies.
   * - Multiple payments in the same currency, but where one payment is for marketplace fees while
   *   another payment is for the seller.
   */
  payments: SupportedPayment[];
}

const getSeaportItemExtractions = (
  namespaceId: ENSNamespaceId,
  chainId: ChainId,
  items: readonly (OfferItem | ConsiderationItem)[],
): SeaportItemExtractions => {
  const extractions: SeaportItemExtractions = {
    nfts: [],
    payments: [],
  };

  // each item is either a supported NFT, a supported payment, or unsupported
  for (const item of items) {
    // if the item is an nft, push to nfts
    const nft = getSupportedNFT(namespaceId, chainId, item);
    if (nft) {
      extractions.nfts.push(nft);
      continue;
    }

    // if the item is a payment, push to payments
    const payment = getSupportedPayment(chainId, item);
    if (payment) {
      extractions.payments.push(payment);
    }
  }

  return extractions;
};

const consolidateSupportedNFTs = (nfts: SupportedNFT[]): SupportedNFT | null => {
  // Either no NFT or multiple NFTs
  if (nfts.length !== 1) return null;
  // biome-ignore lint/style/noNonNullAssertion: ok due to length check above
  return nfts[0]!;
};

const consolidateSupportedPayments = (payments: SupportedPayment[]): SupportedPayment | null => {
  // Get the set of distinct currencies in the payment
  const uniqueCurrencies = uniq(payments.map((payment) => payment.price.currency));

  // Either no payment or multiple payments in mixed currencies
  if (uniqueCurrencies.length !== 1) return null;

  // consolidate multiple payments in the same currency into one.
  const totalAmount = payments.reduce((total, payment) => total + payment.price.amount, 0n);

  return {
    price: {
      // biome-ignore lint/style/noNonNullAssertion: we verified above there's exactly one currency
      currency: uniqueCurrencies[0]!,
      amount: totalAmount,
    },
  };
};

/**
 * Maps from Seaport-specific OrderFulfilled event into our more generic TokenScope `SupportedSale`,
 * if possible. TokenScope aims to deliver a simpler datamodel than Seaport provides but still
 * support the majority of real-world use cases.
 */
export const getSupportedSaleFromOrderFulfilledEvent = (
  namespaceId: ENSNamespaceId,
  chainId: ChainId,
  event: OrderFulfilledEvent,
): SupportedSale | null => {
  const { offer, consideration, orderHash, offerer, recipient } = event.args;

  const { nfts: offerNFTs, payments: offerPayments } = getSeaportItemExtractions(
    namespaceId,
    chainId,
    offer,
  );

  const { nfts: considerationNFTs, payments: considerationPayments } = getSeaportItemExtractions(
    namespaceId,
    chainId,
    consideration,
  );

  const consolidatedOfferNFT = consolidateSupportedNFTs(offerNFTs);
  const consolidatedConsiderationNFT = consolidateSupportedNFTs(considerationNFTs);
  const consolidatedOfferPayment = consolidateSupportedPayments(offerPayments);
  const consolidatedConsiderationPayment = consolidateSupportedPayments(considerationPayments);

  // offer is exactly 1 supported NFT and consideration consolidates to 1 supported payment
  // therefore the offerer is the seller and the recipient is the buyer
  if (
    consolidatedOfferNFT &&
    !consolidatedConsiderationNFT &&
    !consolidatedOfferPayment &&
    consolidatedConsiderationPayment
  ) {
    return {
      orderHash,
      nft: consolidatedOfferNFT,
      payment: consolidatedConsiderationPayment,
      seller: offerer,
      buyer: recipient,
    };
  }

  // consideration is exactly 1 supported NFT and offer consolidates to 1 supported payment
  // therefore the recipient is the seller and the offerer is the buyer
  if (
    !consolidatedOfferNFT &&
    consolidatedConsiderationNFT &&
    consolidatedOfferPayment &&
    !consolidatedConsiderationPayment
  ) {
    return {
      orderHash,
      nft: consolidatedConsiderationNFT,
      payment: consolidatedOfferPayment,
      seller: recipient,
      buyer: offerer,
    };
  }

  // otherwise, unsupported sale
  return null;
};

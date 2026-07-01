import { stringifyAssetId } from "enssdk";

import { PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../adapter";
import { namespaceContract } from "../../../lib/namespace-contract";
import { upsertAccount } from "../../../lib/subgraph/db-helpers";
import { makeEventId } from "../../../lib/subgraph/ids";
import { getSupportedSaleFromOrderFulfilledEvent } from "../../../lib/tokenscope/seaport";
import { ensIndexerSchema } from "../../../schema";

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.TokenScope;

  adapter.on(
    namespaceContract(pluginName, "Seaport:OrderFulfilled"),
    async ({ context, event }) => {
      const sale = getSupportedSaleFromOrderFulfilledEvent(
        context.namespace,
        context.chain.id,
        event,
      );

      // the Seaport sale in the event is not supported by TokenScope, no-op
      // this can happen for a number of reasons, including:
      // - the sale was for a NFT that is not recognized as being associated with an ENS name
      //   (note how this event is triggered for any sale made through Seaport, not just ENS names)
      // - the sale was not paid for with a supported currency (e.g. ETH, USDC, etc)
      // - the sale received payments in multiple currencies
      // - the sale was for multiple NFTs (not just one)
      // TokenScope purposefully does not support these cases as we believe they overall add
      // more complexity than benefit. We believe it's better to prioritize better simplicity of
      // building apps on TokenScope than supporting these more complex and uncommon cases.
      if (!sale) return;

      // upsert buyer and seller accounts
      await upsertAccount(context, sale.seller);
      await upsertAccount(context, sale.buyer);

      const assetIdString = stringifyAssetId(sale.nft);

      // insert NameSale entity
      await context.ensDb.insert(ensIndexerSchema.nameSales).values({
        id: makeEventId(
          context.isSubgraphCompatible,
          context.chain.id,
          event.block.number,
          event.log.logIndex,
        ),
        chainId: sale.nft.contract.chainId,
        blockNumber: event.block.number,
        logIndex: event.log.logIndex,
        transactionHash: event.transaction.hash,
        orderHash: sale.orderHash,
        contractAddress: sale.nft.contract.address,
        tokenId: sale.nft.tokenId,
        assetNamespace: sale.nft.assetNamespace,
        assetId: assetIdString,
        domainId: sale.nft.domainId,
        buyer: sale.buyer,
        seller: sale.seller,
        currency: sale.payment.price.currency,
        amount: sale.payment.price.amount,
        timestamp: event.block.timestamp,
      });
    },
  );
}

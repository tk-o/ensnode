import { DatasourceNames } from "@ensnode/datasources";
import { type NFTTransferEventMetadata, PluginName } from "@ensnode/ensnode-sdk";

import type { IndexingEngineAdapter } from "../../../adapter";
import { namespaceContract } from "../../../lib/namespace-contract";
import { buildSupportedNFT } from "../../../lib/tokenscope/nft-issuers";
import { handleNFTTransfer } from "../lib/handle-nft-transfer";

/**
 * Registers event handlers with Ponder.
 */
export default function (adapter: IndexingEngineAdapter) {
  const pluginName = PluginName.TokenScope;

  adapter.on(
    namespaceContract(pluginName, "EthBaseRegistrar:Transfer"),
    async ({ context, event }) => {
      const nft = buildSupportedNFT(
        context.namespace,
        DatasourceNames.ENSRoot,
        "BaseRegistrar",
        event.args.tokenId,
      );

      const metadata: NFTTransferEventMetadata = {
        chainId: context.chain.id,
        blockNumber: event.block.number,
        transactionHash: event.transaction.hash,
        eventHandlerName: "EthBaseRegistrar:Transfer",
        nft,
      };

      await handleNFTTransfer(context, event.args.from, event.args.to, false, nft, metadata);
    },
  );

  adapter.on(
    namespaceContract(pluginName, "BaseBaseRegistrar:Transfer"),
    async ({ context, event }) => {
      const nft = buildSupportedNFT(
        context.namespace,
        DatasourceNames.Basenames,
        "BaseRegistrar",
        event.args.tokenId,
      );

      const metadata: NFTTransferEventMetadata = {
        chainId: context.chain.id,
        blockNumber: event.block.number,
        transactionHash: event.transaction.hash,
        eventHandlerName: "BaseBaseRegistrar:Transfer",
        nft,
      };

      await handleNFTTransfer(context, event.args.from, event.args.to, false, nft, metadata);
    },
  );

  adapter.on(
    namespaceContract(pluginName, "LineaBaseRegistrar:Transfer"),
    async ({ context, event }) => {
      const nft = buildSupportedNFT(
        context.namespace,
        DatasourceNames.Lineanames,
        "BaseRegistrar",
        event.args.tokenId,
      );

      const metadata: NFTTransferEventMetadata = {
        chainId: context.chain.id,
        blockNumber: event.block.number,
        transactionHash: event.transaction.hash,
        eventHandlerName: "LineaBaseRegistrar:Transfer",
        nft,
      };

      await handleNFTTransfer(context, event.args.from, event.args.to, false, nft, metadata);
    },
  );
}

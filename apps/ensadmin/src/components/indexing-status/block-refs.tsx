/**
 * This file defines UI components for presenting {@link BlockRef}.
 */

import { RelativeTime } from "@/components/datetime-utils";
import { getBlockExplorerUrlForBlock } from "@/lib/namespace-utils";
import { BlockRef, ChainId } from "@ensnode/ensnode-sdk";
import { ExternalLink } from "lucide-react";

interface BlockNumberProps {
  chainId: ChainId;
  block: BlockRef;
}

/**
 * Displays the block number for a BlockInfo.
 *
 * Optionally provides a link to the block details page on the chain's designated block explorer page.
 * If the chain has no known block explorer, just displays the block number (without link).
 **/
function BlockNumber({ chainId, block }: BlockNumberProps) {
  const blockExplorerUrl = getBlockExplorerUrlForBlock(chainId, block.number);
  if (blockExplorerUrl) {
    return (
      <a
        href={blockExplorerUrl.toString()}
        target="_blank"
        rel="noreferrer noopener"
        className="w-fit text-lg font-semibold flex items-center gap-1 text-blue-600 hover:underline cursor-pointer"
      >
        #{block.number}
        <ExternalLink size={16} className="inline-block flex-shrink-0" />
      </a>
    );
  }

  return <div className="text-lg font-semibold">#${block.number}</div>;
}

interface BlockStatsProps {
  chainId: ChainId;
  label: string;
  block: BlockRef | null;
}

/**
 * Component to display requested block stats.
 */
export function BlockStats({ chainId, label, block }: BlockStatsProps) {
  // return a fallback for undefined block
  if (!block) {
    return (
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold">∞</div>
      </div>
    );
  }

  // if the block is defined, return its details
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <BlockNumber block={block} chainId={chainId} />
      <div className="text-xs text-muted-foreground">
        <RelativeTime
          timestamp={block.timestamp}
          enforcePast={true}
          conciseFormatting={true}
          includeSeconds={true}
          prefix="from "
        />
      </div>
    </div>
  );
}

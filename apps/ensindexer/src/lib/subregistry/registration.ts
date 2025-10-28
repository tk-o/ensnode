import type { Node, UnixTimestamp } from "@ensnode/ensnode-sdk";

export interface SubregistryRegistration {
  node: Node;

  parentNode: Node;

  expiresAt: UnixTimestamp;
}

export function buildSubregistryRegistration({
  node,
  parentNode,
  expiresAt,
}: {
  node: Node;
  parentNode: Node;
  expiresAt: bigint;
}): SubregistryRegistration {
  return {
    node,
    parentNode,
    expiresAt: Number(expiresAt),
  };
}

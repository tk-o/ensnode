import type { BlockRef } from "./domain-types";

/**
 * {@link BlockRef} helpers
 */
export const blockRef = {
  isBeforeOrSameAs(blockA: BlockRef, blockB: BlockRef) {
    // compare block creation dates
    if (blockA.createdAt.getTime() <= blockB.createdAt.getTime()) return true;

    // compare block numbers
    if (blockA.number <= blockB.number) {
      return true;
    }

    return false;
  },

  isSameAs(blockA: BlockRef, blockB: BlockRef) {
    // compare block creation dates
    if (blockA.createdAt.getTime() === blockB.createdAt.getTime()) return true;

    // compare block numbers
    if (blockA.number === blockB.number) {
      return true;
    }

    return false;
  },
} as const;

/**
 * This file contains helpers for working with Registration records.
 */
import type { Context } from "ponder:registry";
import schema from "ponder:schema";

import type { EventRef, RegistrarEventName } from "@ensnode/ensnode-sdk";

/**
 * Make Event Ref record in database.
 */
export async function makeEventRef(context: Context, event: EventRef<RegistrarEventName>) {
  const { block, ...remainingEventFields } = event;

  await context.db.insert(schema.registrarEvent).values({
    blockNumber: BigInt(block.number),
    blockTimestamp: BigInt(block.timestamp),
    ...remainingEventFields,
  });
}

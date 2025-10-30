import type { Context, Event } from "ponder:registry";
import schema from "ponder:schema";

import type { RegistrarAction } from "@ensnode/ensnode-sdk";

/**
 * Handles an individual occurrence of a Registrar Action of
 * given {@link RegistrarActionType}.
 */
export async function handleRegistrarAction(
  context: Context,
  event: Pick<Event, "id">,
  {
    type,
    node,
    incrementalDuration,
    baseCost,
    premium,
    total,
    registrant,
    encodedReferrer,
    decodedReferrer,
    chainId,
    timestamp,
    transactionHash,
    logIndex,
  }: RegistrarAction,
) {
  // TODO: enforce an invariant that for Renewal actions,
  // the registration must be in a "renewable" state.
  // We can't add the state invariant about name renewals yet, because
  // doing so would require us to index more historical RegistrarControllers

  // 1. Update the Subregistry Registration record
  // This record represents the current registration state for the `node`.
  // The record must already exist, as it is created upon handling
  // the Base Registrar:NameRegistered event.
  await context.db
    .update(schema.subregistry_registration, {
      node,
    })
    .set(({ expiresAt }) => ({
      isControllerManaged: true,
      expiresAt: expiresAt + BigInt(incrementalDuration), // extend current registration expiry
    }));

  // 2. Insert the Registrar Action record
  await context.db.insert(schema.subregistry_registrarAction).values({
    id: event.id,
    type,
    node,
    baseCost: baseCost.amount,
    premium: premium.amount,
    total: total.amount,
    registrant,
    encodedReferrer,
    decodedReferrer,
    incrementalDuration: BigInt(incrementalDuration),
    timestamp: BigInt(timestamp),
    chainId,
    transactionHash,
    logIndex,
  });
}

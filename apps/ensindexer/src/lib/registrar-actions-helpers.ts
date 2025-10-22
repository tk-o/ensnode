/**
 * Shared Helpers for managing Referral entities, usable by any contract that wishes to track
 * referral information.
 */

import type { Context, Event } from "ponder:registry";
import schema from "ponder:schema";
import type { Address } from "viem";

import {
  type Node,
  type RawReferrer,
  RegistrarActionType,
  type RegistrarActionTypes,
  interpretRawReferrer,
} from "@ensnode/ensnode-sdk";

/**
 * Get the incremental duration for Registrar Action.
 *
 * Definition of "incremental duration" is
 * the incremental increase in the lifespan of the current registration.
 *
 * @returns incremental duration in seconds.
 * @throws if Registrar Action is Renewal and no related
 *         Registration was indexed before.
 */
export async function getIncrementalDurationForRegistrarAction(
  context: Context,
  event: Event,
  registrarAction: {
    type: RegistrarActionTypes;
    node: Node;
    expiresAt: bigint;
  },
): Promise<bigint> {
  let incrementalDurationStartsAt: bigint;
  const incrementalDurationEndsAt = registrarAction.expiresAt;

  switch (registrarAction.type) {
    case RegistrarActionType.Registration:
      incrementalDurationStartsAt = event.block.timestamp;
      break;

    case RegistrarActionType.Renewal:
      {
        const latestRegistrarActionForCurrentRegistration =
          await context.db.sql.query.subregistry_registrarAction.findFirst({
            where: (fields, { and, eq }) => and(eq(fields.node, registrarAction.node)),
            orderBy: (fields, { desc }) => [desc(fields.blockTimestamp)],
          });

        // Invariant: there must be some registrar action indexed before the renewal can take place.
        if (!latestRegistrarActionForCurrentRegistration) {
          throw new Error(
            `At least one prior registrar action for "${registrarAction.node}" node must exist for the renewal to take place.`,
          );
        }

        incrementalDurationStartsAt = latestRegistrarActionForCurrentRegistration.expiresAt;
      }
      break;

    default:
      throw new Error(`Unhandled Registrar Action type: "${registrarAction.type}"`);
  }

  if (incrementalDurationEndsAt > incrementalDurationStartsAt) {
    throw new Error(`Incremental Duration end timestamp must be before its start timestamp.`);
  }

  // We need to calculate the “incrementalDuration” with special care.
  // For example: when a renewal happens, the duration of the renewal is
  // a distinct idea from when the name expires.
  // Therefore our definition of “incrementalDuration” in this field is
  // the incremental increase in the lifespan of the current registration.
  return incrementalDurationEndsAt - incrementalDurationStartsAt;
}

/**
 * Handles an individual occurrence of a Registrar Action of
 * given {@link RegistrarActionType}.
 */
export async function handleRegistrarAction(
  context: Context,
  event: Event,
  {
    type,
    node,
    expiresAt,
    baseCost,
    premium,
    registrant,
    rawReferrer,
  }: {
    type: RegistrarActionTypes;
    node: Node;
    expiresAt: bigint;
    baseCost: bigint;
    premium: bigint;
    registrant: Address;
    rawReferrer: RawReferrer;
  },
) {
  const total = baseCost + premium;

  const interpretedReferrer = interpretRawReferrer(rawReferrer);

  const incrementalDuration = await getIncrementalDurationForRegistrarAction(context, event, {
    type,
    node,
    expiresAt,
  });

  // create the Registrar Action event
  await context.db.insert(schema.subregistry_registrarAction).values({
    id: event.id,
    type,
    node,
    expiresAt,
    baseCost,
    premium,
    total,
    registrant,
    rawReferrer,
    interpretedReferrer,
    incrementalDuration,
    blockTimestamp: event.block.timestamp,
    chainId: context.chain.id,
    transactionHash: event.transaction.hash,
  });
}

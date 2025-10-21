/**
 * Shared Helpers for managing Referral entities, usable by any contract that wishes to track
 * referral information.
 */

import type { Context, Event } from "ponder:registry";
import schema from "ponder:schema";
import type { Address } from "viem";

import {
  Duration,
  type Node,
  type RawReferrer,
  RegistrarActionType,
  type RegistrarActionTypes,
  interpretRawReferrer,
} from "@ensnode/ensnode-sdk";

export async function calculateIncrementalDuration(): Promise<Duration> {
  return 0;
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

  let currentRegistrationStartedAt: bigint;

  switch (type) {
    case RegistrarActionType.Registration:
      currentRegistrationStartedAt = event.block.timestamp;
    case RegistrarActionType.Renewal: {
      const currentRegistration = await context.db.sql.query.subregistry_registrarAction.findFirst({
        where(table, { and, eq }) {
          return and(eq(table.node, node));
        },
      });

      // Invariant: registration must be indexed before renewal
      if (!currentRegistration) {
        throw new Error("There must be a current registration for the renewal to take place.");
      }

      currentRegistrationStartedAt = currentRegistration.blockTimestamp;
    }
  }

  // We need to calculate the “incrementalDuration” with special care.
  // For example: when a renewal happens, the duration of the renewal is
  // a distinct idea from when the name expires.
  // Therefore our definition of “incrementalDuration” in this field is
  // the incremental increase in the lifespan of the current registration.
  const incrementalDuration = expiresAt - currentRegistrationStartedAt;

  // create the Registrar Action event
  await context.db.insert(schema.subregistry_registrarAction).values({
    id: event.id,
    type,
    node,
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

/**
 * Schema Definitions for tracking of ENS subregistries.
 */

import { index, onchainEnum, onchainTable } from "ponder";

export const subregistry_registrarActionType = onchainEnum("registrar_action_type", [
  "registration",
  "renewal",
]);

export const subregistry_registrarAction = onchainTable(
  "registrar_action",
  (t) => ({
    // keyed by any arbitrary unique id, usually `event.id`
    id: t.text().primaryKey(),

    type: subregistry_registrarActionType().notNull(),

    node: t.hex().notNull(),

    baseCost: t.bigint().notNull(),

    premium: t.bigint().notNull(),

    total: t.bigint().notNull(),

    registrant: t.hex().notNull(),

    rawReferrer: t.hex().notNull(),

    interpretedReferrer: t.hex().notNull(),

    /**
     * The timestamp of registration expiry.
     */
    expiresAt: t.bigint().notNull(),

    /**
     * The incremental increase in the lifespan of the current registration.
     */
    incrementalDuration: t.bigint().notNull(),

    // Block's Unix timestamp in seconds
    blockTimestamp: t.bigint().notNull(),

    // chainId the transaction occurred on
    chainId: t.integer().notNull(),

    // Transaction's hash
    transactionHash: t.hex().notNull(),
  }),
  (t) => ({
    byReferee: index().on(t.registrant),
    byReferrer: index().on(t.interpretedReferrer),
  }),
);

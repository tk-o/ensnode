import type { Context } from "ponder:registry";

import type { RegistrarAction, RegistrarActionType } from "@ensnode/ensnode-sdk";

import { makeRegistrarAction } from "./registrar-action";
import { makeEventRef } from "./registrar-event-ref";
import { markRegistrationAsManagedByController } from "./registration";

/**
 * Handles an individual occurrence of a Registrar Action of
 * given {@link RegistrarActionType}.
 */
export async function handleRegistrarAction(
  context: Context,
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
    eventRef,
  }: RegistrarAction,
) {
  // 1. Mark the Registration for the `node` value as controller-managed.
  await markRegistrationAsManagedByController(context, { node });

  // 2. Insert the Registrar Event record.
  await makeEventRef(context, eventRef);

  // 3. Insert the Registrar Action record.
  await makeRegistrarAction(context, {
    type,
    node,
    incrementalDuration,
    baseCost,
    premium,
    total,
    registrant,
    encodedReferrer,
    decodedReferrer,
    eventRef,
  });
}

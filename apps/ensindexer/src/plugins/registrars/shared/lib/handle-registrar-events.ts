/**
 * This file contains handlers used in event handlers for a Registrar contract.
 */
import type { Context } from "ponder:registry";
import type { Address } from "viem";

import type {
  ChainId,
  EventRef,
  Node,
  RegistrarEventNames,
  UnixTimestamp,
} from "@ensnode/ensnode-sdk";

import { addControllerToRegistrar, removedControllerFromRegistrar } from "./registrar-controller";
import { makeEventRef } from "./registrar-event-ref";
import {
  getCurrentRegistration,
  makeFirstRegistration,
  makeSubsequentRegistration,
  renewRegistration,
} from "./registration";

/**
 * Handle Registration
 */
export async function handleRegistration(
  context: Context,
  event: EventRef<typeof RegistrarEventNames.NameRegistered>,
  {
    node,
    parentNode,
    expiresAt,
  }: {
    node: Node;
    parentNode: Node;
    expiresAt: UnixTimestamp;
  },
) {
  // 0. Get the state of the registration for this node before this registration occurred.
  const currentRegistration = await getCurrentRegistration(context, { node });

  if (currentRegistration !== null) {
    // 1. If a Registration for the `node` has been already indexed, and
    // we now have to handle `NameRegistered` event, it means that
    // another Registration was made for the `node` after
    // the previously indexed Registration expired and its grace period ended.
    await makeSubsequentRegistration(context, { node, expiresAt });
  } else {
    // 1. It's a first-time registration made for the `node` value.
    await makeFirstRegistration(context, {
      node,
      parentNode,
      expiresAt,
    });
  }

  // 2. Insert the Registrar Event record.
  await makeEventRef(context, event);
}

/**
 * Handle Renewal
 */
export async function handleRenewal(
  context: Context,
  event: EventRef<typeof RegistrarEventNames.NameRenewed>,
  {
    node,
    expiresAt,
  }: {
    node: Node;
    expiresAt: UnixTimestamp;
  },
) {
  // TODO: 0. enforce an invariant that for Renewal actions,
  // the registration must be in a "renewable" state.
  // We can't add the state invariant about name renewals yet, because
  // doing so would require us to index more historical RegistrarControllers

  // 1. Extends Registration's expiry
  await renewRegistration(context, { node, expiresAt });

  // 2. Insert the Registrar Event record.
  await makeEventRef(context, event);
}

/**
 * Handle Controller being added to Registrar.
 */
export async function handleControllerAddedToRegistrar(
  context: Context,
  event: EventRef<typeof RegistrarEventNames.ControllerAdded>,
  {
    chainId,
    controllerAddress,
    registrarAddress,
  }: {
    chainId: ChainId;
    controllerAddress: Address;
    registrarAddress: Address;
  },
) {
  // 1. Update Registrar Controller
  await addControllerToRegistrar(context, {
    chainId,
    controllerAddress,
    registrarAddress,
  });

  // 2. Insert the Registrar Event record.
  await makeEventRef(context, event);
}

/**
 * Handle Controller being removed from Registrar.
 */
export async function handleControllerRemovedFromRegistrar(
  context: Context,
  event: EventRef<typeof RegistrarEventNames.ControllerRemoved>,
  {
    chainId,
    controllerAddress,
  }: {
    chainId: ChainId;
    controllerAddress: Address;
  },
) {
  // 1. Update Registrar Controller
  await removedControllerFromRegistrar(context, {
    chainId,
    controllerAddress,
  });

  // 2. Insert the Registrar Event record.
  await makeEventRef(context, event);
}

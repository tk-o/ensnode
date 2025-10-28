import type { Context } from "ponder:registry";
import schema from "ponder:schema";

import type { Node } from "@ensnode/ensnode-sdk";

import {
  buildSubregistryRegistration,
  type SubregistryRegistration,
} from "@/lib/subregistry/registration";

/**
 * Get currently indexed subregistry registration for a node.
 */
export async function getCurrentRegistration(
  context: Context,
  node: Node,
): Promise<SubregistryRegistration> {
  const currentRegistration = await context.db.find(schema.subregistry_registration, {
    node,
  });

  // Invariant: the current registration must exists for the renewal to take place.
  if (!currentRegistration) {
    throw new Error(
      `The current registration for "${node}" node must exist for the renewal to take place.`,
    );
  }

  return buildSubregistryRegistration(currentRegistration);
}

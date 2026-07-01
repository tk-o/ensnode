import type { AccountId, InterpretedName, Node } from "enssdk";

import type { ENSNamespaceId } from "@ensnode/datasources";
import {
  getManagedName as _getManagedName,
  isNameWrapper as _isNameWrapper,
} from "@ensnode/ensnode-sdk";

/**
 * Engine-agnostic return type for {@link getManagedName}.
 */
export interface ManagedNameResult {
  name: InterpretedName;
  node: Node;
  registry: AccountId;
}

/**
 * Thin wrappers around the SDK's namespace-parameterized helpers. The namespace is passed
 * explicitly so the helpers remain engine-agnostic.
 *
 * @see {@link _getManagedName} for the full docstring on Managed Names.
 */

export const getManagedName = (namespace: ENSNamespaceId, contract: AccountId): ManagedNameResult =>
  _getManagedName(namespace, contract);

export const isNameWrapper = (namespace: ENSNamespaceId, contract: AccountId): boolean =>
  _isNameWrapper(namespace, contract);

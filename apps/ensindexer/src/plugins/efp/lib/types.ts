// NOTE: based on code from https://github.com/ethereumfollowprotocol/onchain/blob/598ab49/src/types.ts#L41-L47

import type { Address } from "viem/accounts";

/**
 * Base List Storage Location
 */
interface BaseListStorageLocation<
  LSLVersion extends ListStorageLocationVersion,
  LSLType extends ListStorageLocationType,
> {
  /**
   * The version of the List Storage Location.
   *
   * This is used to ensure compatibility and facilitate future upgrades.
   */
  version: LSLVersion;

  /**
   * The type of the List Storage Location.
   *
   * This identifies the kind of data the data field contains.
   */
  type: LSLType;
}

/**
 * List Storage Location Contract
 *
 * Describes data model for the EVM contract Location Type as
 * a specialized version of BaseListStorageLocation interface,
 * where the location type is always 1, and, for now, the version is always 1.
 *
 * Documented based on https://docs.efp.app/design/list-storage-location/
 */
export interface ListStorageLocationContract
  extends BaseListStorageLocation<
    ListStorageLocationVersion.V1,
    ListStorageLocationType.EVMContract
  > {
  /**
   * EVM chain ID of the chain where the EFP list records are stored.
   */
  chainId: bigint;

  /**
   * EVM address of the contract on chainId where the EFP list records are stored.
   */
  listRecordsAddress: Address;

  /**
   * The 32-byte value that specifies the storage slot of the EFP list records within the listRecordsAddress contract.
   * This disambiguates multiple lists stored within the same contract and
   * de-couples it from the EFP List NFT token id which is stored on Ethereum and
   * inaccessible on L2s.
   */
  slot: bigint;
}

/**
 * Enum defining recognized List Storage Location Types
 *
 * Based on documentation at:
 * https://docs.efp.app/design/list-storage-location/#location-types
 */
export enum ListStorageLocationType {
  /**
   * EVMContract Data List Storage Location Type encoding:
   * 32-byte chain ID + 20-byte contract address + 32-byte slot
   */
  EVMContract = 1,
}

/**
 * Enum defining recognized List Storage Location Versions
 *
 * Based on documentation at:
 * https://docs.efp.app/design/list-storage-location/#serialization
 */
export enum ListStorageLocationVersion {
  V1 = 1,
}

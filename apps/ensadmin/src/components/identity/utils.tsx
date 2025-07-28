import { ENSNamespaceId, getAddressDetailsUrl, getNameDetailsUrl } from "@ensnode/datasources";
import { ExternalLink } from "lucide-react";
import { Address } from "viem";

interface NameDisplayProps {
  name: string;
  namespaceId: ENSNamespaceId;
  showExternalLinkIcon?: boolean;
}

/**
 * Displays an ENS name.
 * If the ENS namespace has a known ENS Manager App,
 * includes a link to the view the profile associated with the name within that ENS namespace.
 *
 * Optionally shows an external link icon.
 */
export function NameDisplay({ name, namespaceId, showExternalLinkIcon }: NameDisplayProps) {
  const ensAppNameDetailsUrl = getNameDetailsUrl(name, namespaceId);

  if (!ensAppNameDetailsUrl) {
    return <span className="font-medium">{name}</span>;
  }

  return (
    <a
      href={ensAppNameDetailsUrl.toString()}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
    >
      {name}
      {showExternalLinkIcon && <ExternalLink size={14} className="inline-block" />}
    </a>
  );
}

interface AddressDisplayProps {
  address: Address;
  namespaceId: ENSNamespaceId;
  showExternalLinkIcon?: boolean;
}

/**
 * Displays a truncated address.
 * If the ENS namespace has a known ENS Manager App,
 * includes a link to the view details of the address within that ENS namespace.
 *
 * Optionally shows an external link icon.
 */
export function AddressDisplay({
  address,
  namespaceId,
  showExternalLinkIcon,
}: AddressDisplayProps) {
  // Truncate address for display
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const ensAppAddressDetailsUrl = getAddressDetailsUrl(address, namespaceId);

  if (!ensAppAddressDetailsUrl) {
    return <span className="font-mono text-xs">{truncatedAddress}</span>;
  }

  return (
    <a
      href={ensAppAddressDetailsUrl.toString()}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
    >
      {truncatedAddress}
      {showExternalLinkIcon && <ExternalLink size={14} className="inline-block" />}
    </a>
  );
}

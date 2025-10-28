# ENS Referrals

This package is a set of libraries enabling smooth interaction with ENS Referrals data, including shared types, and data processing (such as encoding referrer, decoding encoded referrer, building referral URL to ENS App).

## Installation

```bash
npm install @ensnode/ens-referrals
```

### Basic Usage

```typescript
import { buildEncodedReferrer, decodeEncodedReferrer, bu} from "@ensnode/ens-referrals";
import type { Address } from 'viem';

const referrerAddress: Address = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

// Building an encoded referrer value
const encodedReferrer = buildEncodedReferrer(referrerAddress); // 0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045

// Decoding the encoded referrer value
const decodedReferrer = decodeEncodedReferrer(encodedReferrer); // 0xd8da6bf26964af9d7eed9e03e53415d37aa96045

// Building a referrer URL to ENS App
const referrerUrl = buildReferrerUrl(referrerAddress).toString(); // https://app.ens.domains/?referrer=0xd8da6bf26964af9d7eed9e03e53415d37aa96045
```

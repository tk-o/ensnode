# `subregistry` plugin for ENSIndexer

This plugin allows tracking all registrations and renewals that ever happened for subregistries managing the following names:
- `eth`
- `base.eth`
- `linea.eth`

Additionally, indexing includes all registrar controller addresses that were ever added or removed to any relevant BaseRegistrar contract.

Data indexed by this plugin covers also ENS Referrals, including encoded referrer and decoded referrer values. These values support creating ENS Referral rankings. 

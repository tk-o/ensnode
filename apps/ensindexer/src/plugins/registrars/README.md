# `registrars` plugin for ENSIndexer

This plugin allows tracking all registrations and renewals that ever happened for subregistries managing the following names:
- ENS Root (direct subnames of .eth)
- Basenames
- Lineanames

Additionally, indexing includes all registrar controller addresses that were ever added or removed to any relevant BaseRegistrar contract.

Data indexed by this plugin covers also ENS Referrals, including encoded referrer and decoded referrer values. These values support creating ENS Referral rankings. 

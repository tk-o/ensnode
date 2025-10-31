# `registrars` plugin for ENSIndexer

This plugin allows tracking all registrations and renewals that ever happened for subregistries managing the following names:
- ENS Root (direct subnames of .eth)
- Basenames
- Lineanames

Additionally indexes:
- All Registrar Controllers ever associated with a known Registrar contract.
- All ENS Referrals (for Registrar Controllers supporting ENS Referral Programs).

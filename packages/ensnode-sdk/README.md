# ENSNode SDK

This package is a set of libraries enabling smooth interaction with ENSNode services and data, including data processing (such as validating data and enforcing invariants), and ENS-oriented helper functions.

Learn more about [ENSNode](https://ensnode.io/) from [the ENSNode docs](https://ensnode.io/docs/).

## Package overview

- [`ens`](ens): A utility library for interacting with ENS (Ethereum Name Service) data. It contains various helper functions and tools to facilitate interactions with ENS and ENSNode instances.

- [ensindexer](ensindexer): A library for interacting with ENSIndexer data. It defines data model layout and its constraints, the parsing logic with invariants enforcement. Data model splits into the domain layer and the serialization layer. Data can be transitioned from the domain layer to serialization layer, and vice-versa. This library splits into:
    - [ensindexer/config](ensindexer/config) which focuses one ENSIndexer Configuration area.

- [shared](shared): A library for interacting with shared data. It defines data model layout and its constraints, the parsing logic with invariants enforcement. Data model splits into the domain layer and the serialization layer. Data can be transitioned from the domain layer to serialization layer, and vice-versa.


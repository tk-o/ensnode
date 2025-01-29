# ENSRainbow

ENSRainbow is a label healing sidecar service for ENS names. It provides a simple API endpoint to heal ENS labelhashes back to their original labels.

Special thanks to [The Graph Protocol](https://github.com/graphprotocol/ens-rainbow) for their work on the original ENS Rainbow project and rainbow table generation.

## Prerequisites

- Docker installed on your system
- Node.js v20 or later (for local development)

## Getting the Rainbow Tables

The rainbow tables (6.37 GB) are stored in a public bucket. To download them:

1. Download the rainbow table and verify checksum:
```bash
# Download files
wget https://bucket.ensrainbow.io/ens_names.sql.gz
wget https://bucket.ensrainbow.io/ens_names.sql.gz.sha256sum

# Verify checksum
sha256sum -c ens_names.sql.gz.sha256sum
```

## Quick Start with Docker

1. Build the Docker image (includes data ingestion):
```bash
docker build -t ensnode/ensrainbow .
```

2. Run the container:
```bash
docker run -d -p 3001:3001 ensnode/ensrainbow
```

The service will be available at `http://localhost:3001`.

## API Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```
Response: `{"status":"ok"}`

### Heal Label
```bash
curl http://localhost:3001/v1/heal/0x[labelhash]
```
Example:
```bash
curl http://localhost:3001/v1/heal/0x78441d2a930a233460507c2f25aea5ec5dc278db6aeef9e6ee8b930ccc150e58
```
Response: `{"healed":"sprayfoamroofingaugusta"}`

If the label is not found: `{"healed":null}`

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Build TypeScript:
```bash
npm run build
```

3. Run data ingestion (requires ens_names.sql.gz):
```bash
npm run ingest
```

4. Start the service:
```bash
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `DATA_DIR`: Directory for LevelDB data (default: './data')
- `NODE_ENV`: Node environment (default: 'production' in Docker)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
# Base working stage
FROM node:20-slim AS base
RUN apt-get update && \
    apt-get install -y wget && \
    npm install -g pnpm
WORKDIR /app

# Data stage
FROM base AS ensrainbow.data
RUN wget -nv https://bucket.ensrainbow.io/ens_names.sql.gz
RUN wget -nv https://bucket.ensrainbow.io/ens_names.sql.gz.sha256sum
RUN sha256sum -c ens_names.sql.gz.sha256sum

# Runtime dependencies stage
FROM base AS ensrainbow.runtime_deps
# Copy pnpm workspace configuration files from the root directory
COPY pnpm-workspace.yaml ./
# Copy the root package.json and lockfile
COPY package.json pnpm-lock.yaml ./
# Copy all pnpm workspace modules
COPY packages ./packages
COPY apps ./apps
# Install dependencies for the entire monorepo
RUN pnpm install --frozen-lockfile
# Change to the specific app directory
WORKDIR /app/apps/ensrainbow
# Transpile TypeScript files into JavaScript
RUN pnpm build

# Application runtime stage
FROM base AS ensrainbow.runtime
# Copy top-level dependencies
COPY --from=ensrainbow.runtime_deps /app/node_modules node_modules
# Change to the specific app directory
WORKDIR /app/apps/ensrainbow
# Copy built files and dependencies
COPY --from=ensrainbow.runtime_deps /app/apps/ensrainbow/package*.json .
COPY --from=ensrainbow.runtime_deps /app/apps/ensrainbow/node_modules node_modules
COPY --from=ensrainbow.runtime_deps /app/apps/ensrainbow/dist dist

# Ingestor stage
FROM ensrainbow.runtime AS ingestor
# Copy input data
COPY --from=ensrainbow.data /app/ens_names.sql.gz .
COPY --from=ensrainbow.data /app/ens_names.sql.gz.sha256sum .
# Load input data into the key-value store
RUN node dist/ingest.js
# Verify the number of keys in the database
RUN node dist/count-keys.js

# API server stage
FROM ensrainbow.runtime AS runner
# Copy key-value store data
COPY --from=ingestor /app/apps/ensrainbow/data ./data
# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
# Start the application
CMD ["node", "dist/index.js"]

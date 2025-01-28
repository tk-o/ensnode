FROM node:20-slim as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

FROM node:20-slim as ingestor

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --production

# Copy and process the ENS names file
COPY ens_names.sql.gz ./
RUN node dist/ingest.js && rm ens_names.sql.gz

FROM node:20-slim

WORKDIR /app

# Copy built files, dependencies, and processed data
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=ingestor /app/data ./data
RUN npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"] 
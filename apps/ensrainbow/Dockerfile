FROM node:20-slim as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json ./
RUN pnpm install

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN pnpm build

FROM node:20-slim as ingestor

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built files and dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN pnpm install --prod

# Copy and process the ENS names file
COPY ens_names.sql.gz ./
RUN pnpm ingest && rm ens_names.sql.gz

FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built files, dependencies, and processed data
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=ingestor /app/data ./data
RUN pnpm install --prod

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["pnpm", "start"] 
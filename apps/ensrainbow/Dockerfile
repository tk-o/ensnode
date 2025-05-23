# ensrainbow-data contains an already ingested DB that will be served by the ENSRainbow app
# Using a prebuilt image for ensrainbow-data (infrequently changes) reduces build time for the ENSRainbow app image
# ensrainbow-data image is only supporting amd64 arch hence define platform at the FROM statement
ARG DATA_IMAGE_PLATFORM=linux/amd64
# DATA_IMAGE_NAME is set to either "ensrainbow-data" (default) or "ensrainbow-v2-data" based on the build context.
# It can be set using the --build-arg flag when building the Docker image.
ARG DATA_IMAGE_NAME="ensrainbow-data"

FROM --platform=${DATA_IMAGE_PLATFORM} ghcr.io/namehash/ensnode/${DATA_IMAGE_NAME} AS ensrainbow-data

FROM --platform=${TARGETPLATFORM} node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

###################
## Application Deps — standard monorepo pnpm install from base
###################

FROM base AS deps
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

###################
## App Server — runs server w/ data dir
###################

FROM deps AS runner

# cwd to ensrainbow
WORKDIR /app/apps/ensrainbow

# copy data dir from ensrainbow-data
COPY --from=ensrainbow-data /app/data ./data

# Run a lightweight database validation to ensure the pre-built database is intact and compatible
# This validation checks critical database integrity without performing a full validation,
# which helps reduce container build time while still ensuring the application can start properly
RUN pnpm run validate:lite

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3223
EXPOSE 3223

# serve
CMD ["pnpm", "run", "serve"]

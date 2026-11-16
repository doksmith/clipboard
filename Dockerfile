# ---- Build stage ----
FROM node:20-slim AS builder

WORKDIR /app

# Install build tools required by native modules (better-sqlite3).
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifest first so dependency installation is layer-cached
# independently of source changes.
COPY package.json ./
RUN npm install

# Copy the rest of the source tree and produce the Nitro server bundle.
COPY . .
RUN npm run build


# ---- Production stage ----
FROM node:20-slim

LABEL org.opencontainers.image.title="Clipboard" \
      org.opencontainers.image.description="Self-hosted realtime clipboard and code snippet hub" \
      org.opencontainers.image.source="https://github.com/doksmith/clipboard"

# Create a non-root user.
RUN groupadd --gid 1001 clipboard \
    && useradd --uid 1001 --gid clipboard --shell /bin/sh --create-home clipboard

WORKDIR /app

# Copy the self-contained Nitro output from the builder.
COPY --from=builder --chown=clipboard:clipboard /app/.output .output

# Copy the entrypoint script.
COPY --chown=clipboard:clipboard docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Prepare the persistent data directory for SQLite.
RUN mkdir -p /app/.data && chown clipboard:clipboard /app/.data

USER clipboard

ENV NITRO_PORT=3000
EXPOSE 3000

VOLUME ["/app/.data"]

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]

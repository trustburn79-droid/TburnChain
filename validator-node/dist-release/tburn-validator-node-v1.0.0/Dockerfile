# TBURN Mainnet Validator Node Docker Image
# 
# Build: docker build -t tburn/validator-node:latest .
# Run:   docker run -d -p 26656:26656 -p 8080:8080 tburn/validator-node

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

LABEL org.opencontainers.image.title="TBURN Validator Node"
LABEL org.opencontainers.image.description="TBURN Mainnet Validator Node - Chain ID 6000"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="TBURN Foundation"

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1000 tburn && \
    adduser -u 1000 -G tburn -s /bin/sh -D tburn

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create data directories
RUN mkdir -p /data/blocks /data/state /data/txpool /config /logs && \
    chown -R tburn:tburn /app /data /config /logs

# Switch to non-root user
USER tburn

# Environment variables
ENV NODE_ENV=production
ENV TBURN_DATA_DIR=/data
ENV TBURN_CONFIG_DIR=/config
ENV TBURN_LOG_DIR=/logs

# Expose ports
EXPOSE 26656 8080 8545 8546 9090

# Volume mounts
VOLUME ["/data", "/config", "/logs"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/v1/health || exit 1

# Entry point
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/cli.js", "start", "--config", "/config/validator.json"]

# Multi-stage build for production optimization
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS production

# Create app directory
WORKDIR /app

# Install curl for health checks
RUN apk --no-cache add curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S taskflow -u 1001 -G nodejs

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=taskflow:nodejs . .

# Set user
USER taskflow

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "server.js"]
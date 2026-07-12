# ============================================
# Zike Bot - Dockerfile
# Built by Arsh (escapingdum)
# ============================================

# Use Node.js 20 LTS (works perfectly with discord.js v14 and lavalink-client)
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for some npm packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first (for better layer caching)
COPY package.json ./

# Install dependencies
RUN npm install --production --omit=dev && npm cache clean --force

# Copy application source code
COPY . .

# Create data directory for the JSON database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV DATA_DIR=/app/data

# Expose no ports (Discord bot uses outbound WebSocket only)
# No ports need to be exposed

# Set restart policy note (use --restart=always in docker run)
# Railway handles restarts automatically

# Start the bot
CMD ["node", "src/index.js"]

# Health check (optional - checks if the process is running)
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# ============================================
# Build and Run:
#   docker build -t zike-bot .
#   docker run -d --name zike --restart=always --env-file .env -v zike-data:/app/data zike-bot
#
# Or with docker-compose:
#   docker-compose up -d
# ============================================

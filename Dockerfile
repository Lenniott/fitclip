# Simple Dockerfile for Fitness Builder UI
FROM node:18-alpine

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Install serve and start the app
RUN npm install -g serve

# Change ownership of the app directory to the nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 8888

# Use explicit host binding for Portainer compatibility
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:8888"] 
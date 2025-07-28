# Simple Dockerfile for Fitness Builder UI
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Install serve and start the app
RUN npm install -g serve
EXPOSE 8888

CMD ["serve", "-s", "dist", "-l", "8888"] 
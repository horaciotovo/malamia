# Backoffice Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json tsconfig.node.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY postcss.config.cjs tailwind.config.js ./

# Copy source
COPY src ./src

# Install dependencies
RUN npm install

# Build with Vite
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the dist folder
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5173

# Start the app
CMD serve -s dist -l 5173

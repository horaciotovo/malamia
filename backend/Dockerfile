# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy source and prisma
COPY src ./src
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npm run db:generate

# Build TypeScript
RUN npm run build

# Run migrations and start server
CMD npm run db:migrate && npm start

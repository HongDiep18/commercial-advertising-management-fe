# STAGE 1: Build Stage - Compile the Next.js App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (Docker layer caching optimization)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all source code
COPY . .

# Build the Next.js application
# This creates an optimized production build
RUN npm run build

# STAGE 2: Production Stage - Run Next.js
FROM node:20-alpine AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Expose port 3000 (Next.js default)
EXPOSE 3000

# Start Next.js server
CMD ["npm", "start"]

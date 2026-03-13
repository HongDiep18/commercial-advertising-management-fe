# STAGE 1: Build Stage - Compile the Next.js App
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first (Docker layer caching optimization)
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm and lockfile
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Build the Next.js application
# This creates an optimized production build
RUN pnpm run build

# STAGE 2: Production Stage - Run Next.js
FROM node:20-alpine AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies with pnpm
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Expose port 3000 (Next.js default)
EXPOSE 3000

# Start Next.js server
CMD ["pnpm", "start"]

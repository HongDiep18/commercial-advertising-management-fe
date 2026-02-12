# STAGE 1: Build Stage - Compile the React App
# Think of this as the "compilation phase" - we need Node.js to:
# 1. Install dependencies (npm install)
# 2. Build the TypeScript/React code (npm run build)
# 3. Output static files to /dist directory
FROM node:20-alpine AS builder

# Set working directory inside container
# This is like `cd` into a folder - all commands run here
WORKDIR /app

# Copy package files first (Docker layer caching optimization)
# Why separate? If dependencies don't change, Docker reuses this layer
# This is like copying your package.json before copying all source code
COPY package.json package-lock.json ./

# Install dependencies
# This creates a layer that Docker can cache if package.json doesn't change
RUN npm ci --only=production=false
# Using `npm ci` instead of `npm install` for:
# - Faster, more reliable installs
# - Deterministic builds (uses exact versions from package-lock.json)

# Copy all source code
# Now we copy everything else - this layer invalidates when code changes
COPY . .

# Build the application
# This runs: tsc -b && vite build
# Outputs optimized static files to /app/dist
RUN npm run build

# STAGE 2: Production Stage - Serve Static Files
# Think of this as the "runtime phase" - we only need a web server
# We don't need Node.js anymore, just nginx to serve static HTML/CSS/JS
FROM nginx:alpine AS production

# Copy built files from builder stage
# This is like copying your /dist folder to the web server
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (optional but recommended)
# This handles React Router's client-side routing
# Without this, refreshing /about would give 404
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (nginx default)
# This tells Docker: "this container listens on port 80"
EXPOSE 80

# Start nginx
# This is the command that runs when container starts
CMD ["nginx", "-g", "daemon off;"]
# `daemon off;` keeps nginx in foreground so Docker can track the process

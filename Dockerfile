FROM node:18-alpine3.18

# Install OpenSSL 3 for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Copy Prisma schema (needed for postinstall hook)
COPY prisma ./prisma

# Install pnpm and dependencies
RUN npm install -g pnpm@9.0.0
RUN pnpm install --no-frozen-lockfile

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of source code
COPY . .

# Build the application
RUN pnpm run build

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 8080

# Start script that runs migrations then starts the app
CMD ["./start.sh"]

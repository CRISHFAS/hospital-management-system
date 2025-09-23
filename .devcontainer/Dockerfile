FROM mcr.microsoft.com/devcontainers/typescript-node:18

# Install additional tools
RUN npm install -g @nrwl/cli pnpm tsx nodemon

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

# Set working directory
WORKDIR /workspace

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose ports
EXPOSE 3000 3001 3333
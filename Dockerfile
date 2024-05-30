# Use the latest slim Node.js image
FROM node:current-slim

# Set the DATABASE_URL argument for Prisma
ARG DATABASE_URL

# Required for Prisma client to work in a Docker container
RUN apt-get update && apt-get install -y openssl

# Set the working directory for the application
WORKDIR /opt/supersub

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the entire application code
COPY . .

# Build the application and run database migrations
RUN npm run db:deploy && npm run db:generate && npm run build

# Expose port 8080 for the application
EXPOSE 8080

# Start the application
CMD npm run start

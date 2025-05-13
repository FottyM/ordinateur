# Base image with shared setup
FROM node:22-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# Development stage (optional, for local dev setups)
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "start:dev"]

# Build stage - includes devDependencies so the build works
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# Production runtime image - slim and secure
FROM node:22-alpine AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Only bring production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled output from build stage
COPY --from=build /usr/src/app/dist ./dist

EXPOSE $PORT
CMD ["node", "dist/main"]

FROM node:20-alpine AS builder
WORKDIR /app

# NOTE: These ARGs are placeholder values required for SvelteKit's static analysis at build time.
# They are NOT the real production values — real secrets are injected at runtime via env_file in docker-compose.
# Do NOT pass real ENCRYPTION_KEY or META_APP_SECRET as --build-arg when building production images.
ARG POCKETBASE_URL=http://pocketbase:8090
ARG PUBLIC_POCKETBASE_URL=http://pocketbase:8090
ARG META_APP_ID=placeholder
ARG META_APP_SECRET=placeholder
ARG META_REDIRECT_URI=http://localhost:3000/api/meta/callback
ARG ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000
ARG PUBLIC_APP_URL=http://localhost:3000
ENV POCKETBASE_URL=$POCKETBASE_URL
ENV PUBLIC_POCKETBASE_URL=$PUBLIC_POCKETBASE_URL
ENV META_APP_ID=$META_APP_ID
ENV META_APP_SECRET=$META_APP_SECRET
ENV META_REDIRECT_URI=$META_REDIRECT_URI
ENV ENCRYPTION_KEY=$ENCRYPTION_KEY
ENV PUBLIC_APP_URL=$PUBLIC_APP_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]

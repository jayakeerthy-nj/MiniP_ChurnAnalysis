FROM node:20-alpine AS builder
WORKDIR /app

# BACKEND_URL is used by Next.js rewrites to proxy /api/* to the backend.
# Set this to the internal Docker service name (e.g. http://backend:5000).
ARG BACKEND_URL=http://backend:5000
ENV BACKEND_URL=$BACKEND_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]

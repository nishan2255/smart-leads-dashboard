# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ─── Production Stage (nginx) ─────────────────────────────────────────────────
FROM nginx:alpine AS production

# Copy built React app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for React Router (SPA support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

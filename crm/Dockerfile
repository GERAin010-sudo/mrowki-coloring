FROM node:22-alpine

WORKDIR /app

# Install deps first (cache layer)
COPY package*.json ./
RUN npm ci --production

# Copy the rest of CRM
COPY . .

# Persist DB + uploads via volumes
VOLUME ["/app/uploads"]

ENV NODE_ENV=production
ENV PORT=3000
# COOKIE_SECURE controlled via env_file (1=always, 0=never, unset=auto)
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/login.html || exit 1

CMD ["node", "server.js"]

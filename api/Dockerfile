# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
# Optional extra CA (only needed behind a TLS-intercepting proxy):
#   docker build --secret id=ca,src=/path/to/ca.crt ...
RUN --mount=type=secret,id=ca,required=false \
    NODE_EXTRA_CA_CERTS=$([ -f /run/secrets/ca ] && echo /run/secrets/ca) npm ci --omit=dev
COPY *.mjs ./
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]

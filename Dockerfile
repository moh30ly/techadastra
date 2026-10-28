# Builds the static site and serves it with nginx.
FROM node:22-alpine AS build
WORKDIR /site
COPY build.mjs ./
COPY src ./src
RUN node build.mjs

FROM nginx:1.27-alpine
COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site/dist /usr/share/nginx/html

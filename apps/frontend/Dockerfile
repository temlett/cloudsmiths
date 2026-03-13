FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY . .
ARG BACKEND_API_URL
ARG AUTH_BASE_URL
ENV BACKEND_API_URL=$BACKEND_API_URL
ENV AUTH_BASE_URL=$AUTH_BASE_URL
RUN npm run build:frontend

FROM nginx:1.27-alpine AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend /usr/share/nginx/html
EXPOSE 8080
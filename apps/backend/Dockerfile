FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build:backend

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist/apps/backend ./dist/apps/backend
COPY --from=build /app/dist/libs ./dist/libs
EXPOSE 3333
CMD ["node", "dist/apps/backend/main.js"]
FROM node:18 AS base

WORKDIR /app
COPY package*.json ./
RUN npm install


FROM base AS dev

COPY . .
CMD ["npm", "run", "start"]



FROM base AS build
COPY . .
RUN npm run build -- --output-path=dist --configuration=production



FROM nginx:stable-alpine AS prod

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

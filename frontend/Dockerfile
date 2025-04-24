FROM node:18 AS builder
WORKDIR /app
COPY nwlog/package*.json .
RUN npm install
COPY nwlog/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.prod.conf /etc/nginx/nginx.conf
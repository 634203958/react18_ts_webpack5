ARG registry

FROM ${registry}node:14.17.0-alpine as builder

ARG env=build

WORKDIR /app

COPY ./ ./

RUN npm i

RUN npm run $env

FROM ${registry}nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

RUN rm -rf /usr/share/nginx/html/*

RUN echo $(TZ=UTC-8 date +%Y-%m-%d" "%H:%M:%S) > /usr/share/nginx/html/buildinfo.txt

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3027

CMD ["nginx", "-g", "daemon off;"]
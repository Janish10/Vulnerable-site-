FROM nginx:1.25-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/ /etc/nginx/certs/
COPY landing/ /usr/share/nginx/html/landing/

EXPOSE 80 443

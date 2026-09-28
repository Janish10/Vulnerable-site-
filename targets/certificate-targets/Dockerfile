FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY src/ ./src/

# Generate self-signed certs at build time
RUN mkdir -p /app/certs && \
    # Valid cert
    openssl req -x509 -newkey rsa:2048 -keyout /app/certs/valid.key -out /app/certs/valid.crt \
      -days 365 -nodes -subj '/CN=certs.krizznaa.tech' && \
    # Expired cert (1 day, backdated 2 days)
    openssl req -x509 -newkey rsa:2048 -keyout /app/certs/expired.key -out /app/certs/expired.crt \
      -days 1 -nodes -subj '/CN=certs.krizznaa.tech' && \
    # Wrong hostname cert
    openssl req -x509 -newkey rsa:2048 -keyout /app/certs/wrong.key -out /app/certs/wrong.crt \
      -days 365 -nodes -subj '/CN=wrong.example.com'

EXPOSE 3014 3015 3016

CMD ["node", "src/index.js"]

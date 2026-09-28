FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY src/ ./src/
EXPOSE 3012 3013
CMD ["node", "src/index.js"]

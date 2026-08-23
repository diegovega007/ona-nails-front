FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_PUBLIC_API_URL
ENV VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL

RUN npm run build

CMD ["sh", "-c", "rm -rf /output/* && cp -a /app/dist/. /output/"]
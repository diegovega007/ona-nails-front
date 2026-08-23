# syntax=docker/dockerfile:1

FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vacío por defecto: el front pega a /v1.0 y tu nginx del servidor lo reenvía.
# Solo setéalo si el API vive en otro dominio y no usas el proxy de nginx.
ARG VITE_PUBLIC_API_URL=
ENV VITE_PUBLIC_API_URL=$VITE_PUBLIC_API_URL

RUN npm run build

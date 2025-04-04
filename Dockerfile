FROM node:23-alpine AS base

#RUN apt update; npm i -g npm@latest; npm i -g @nestjs/cli
RUN apk update && \
    npm i -g npm@11 && \
    npm i -g @nestjs/cli

WORKDIR /usr/app

COPY ./.env ./.env
COPY ./package*.json .
COPY ./.eslintrc.js .
COPY ./tsconfig*.json .
COPY ./src ./src/

RUN npm cache verify

FROM base AS production
ENV NODE_ENV=production

RUN npm ci --omit=dev
RUN npm run build

FROM base AS dev
ENV NODE_ENV=development

RUN npm install

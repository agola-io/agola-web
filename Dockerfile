FROM node:20-alpine AS web_build

WORKDIR /agola-web

RUN npm install -g pnpm

# copy both 'package.json' and 'pnpm-lock.yaml' (if available)
COPY package.json pnpm-lock.yaml ./
COPY stub/ ./stub/

# install project dependencies
RUN pnpm install

# Copy all the source
COPY . .

# Build app
RUN pnpm run build

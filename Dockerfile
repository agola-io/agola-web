FROM node:22-alpine AS web_build

WORKDIR /agola-web

RUN npm install -g pnpm@^10

# copy both 'package.json' and 'pnpm-lock.yaml' (if available)
COPY package.json pnpm-lock.yaml ./
COPY stub/ ./stub/

# install project dependencies
RUN pnpm install

# Copy all the source
COPY . .

# Build app
RUN pnpm run build

FROM node:12-alpine AS web_build

WORKDIR /agola-web

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install

# Copy all the source
COPY . .

# Build app
RUN npm run build

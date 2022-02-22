FROM golang:1.17.7-bullseye as litestream-builder

# Set gopath for easy reference later
ENV GOPATH=/go

# install wget and unzip to download and extract litestream source
RUN apt-get update && apt-get install -y wget unzip

# download and extract litestream source
RUN wget https://github.com/benbjohnson/litestream/archive/refs/heads/main.zip
RUN unzip ./main.zip -d /src

# set working dir to litestream source
WORKDIR /src/litestream-main

# build and install litestream binary
RUN go install ./cmd/litestream

# base node image
FROM node:16-bullseye-slim as base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

# Install all node_modules, including dev dependencies
FROM base as deps

RUN mkdir /app
WORKDIR /app

ADD package.json package-lock.json ./
RUN npm install --production=false

# Setup production node_modules
FROM base as production-deps

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

# Build the app
FROM base as build

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

# If we're using Prisma, uncomment to cache the prisma schema
ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

# copy litestream binary to /usr/local/bin
COPY --from=litestream-builder /go/bin/litestream /usr/bin/litestream

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules

# Uncomment if using Prisma
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD . .

ADD etc/litestream.primary.yml /etc/litestream.primary.yml
ADD etc/litestream.replica.yml /etc/litestream.replica.yml

CMD ["sh", "start_with_migrations.sh"]

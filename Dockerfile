FROM golang:1.17.7-bullseye as litestream-builder

# set gopath for easy reference later
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

# install openssl for Prisma
RUN apt-get update && apt-get install -y openssl

FROM base as deps

# create dir for app and set working dir
RUN mkdir /app
WORKDIR /app

# install all node_modules, including dev dependencies
ADD package.json package-lock.json ./
RUN npm install --production=false

FROM base as production-deps

# create dir for app and set working dir
RUN mkdir /app
WORKDIR /app

# Copy deps and prune off dev ones
COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

FROM base as build

ENV NODE_ENV=production

# create dir for app and set working dir
RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules

# cache the prisma schema
ADD prisma .
RUN npx prisma generate

# build the app
ADD . .
RUN npm run build

# finally, build the production image with minimal footprint
FROM base

ENV NODE_ENV=production

# copy litestream binary to /usr/local/bin
COPY --from=litestream-builder /go/bin/litestream /usr/bin/litestream
# copy litestream setup script
ADD setup-litestream.js /app/setup-litestream.js
# copy litestream configs
ADD etc/litestream.primary.yml /etc/litestream.primary.yml
ADD etc/litestream.replica.yml /etc/litestream.replica.yml

# copy over production deps
COPY --from=production-deps /app/node_modules /app/node_modules
# copy over generated prisma client
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
# copy over built application and assets
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public

# set working dir
WORKDIR /app

CMD ["sh", "start_with_migrations.sh"]

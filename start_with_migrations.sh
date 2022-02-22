#!/bin/sh

set -ex

npx prisma migrate deploy

node /etc/copy.js

# npm run start
# Start litestream and the main application
litestream replicate -exec "npm run start"
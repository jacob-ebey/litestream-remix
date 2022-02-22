#!/bin/sh

set -ex
npx prisma migrate deploy

# Determine which configuration file to use based on region.
if [ "$FLY_REGION" == "$FLY_PRIMARY_REGION" ]
then
  echo "Using primary region configuration"
	mv /etc/litestream.primary.yml /etc/litestream.yml
else
  echo "Using replica region configuration"
	mv /etc/litestream.replica.yml /etc/litestream.yml
fi

# Start litestream and the main application
litestream replicate -exec "npm run start"
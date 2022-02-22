#!/bin/sh

set -ex
npx prisma migrate deploy

echo "PRIMARY $FLY_PRIMARY_REGION"
echo "CURRENT $FLY_REGION"

# Determine which configuration file to use based on region.
if [ "$FLY_REGION" == "$FLY_PRIMARY_REGION" ]
then
  echo "Using primary region configuration"
	mv /etc/litestream.primary.yml /etc/litestream.yml
else
  echo "Using replica region configuration"
	mv /etc/litestream.replica.yml /etc/litestream.yml
fi

# npm run start
# Start litestream and the main application
litestream replicate -exec "npm run start"
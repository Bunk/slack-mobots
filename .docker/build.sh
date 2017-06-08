#!/usr/bin/env sh
set -ex

apk upgrade
apk update

apk --no-cache add tini curl

npm install
npm update
npm run build
npm prune --production

rm -rf /tmp/*
rm -rf src

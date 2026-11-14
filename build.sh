#!/bin/sh
# Copies app/ to dist/ with the commit's sha (R6). Refuses a dirty tree so the sha names what is deployed.
set -e
cd "$(dirname "$0")"
if [ -n "$(git status --porcelain -- app)" ]; then echo "app/ has uncommitted changes" >&2; exit 1; fi
SHA=$(git rev-parse HEAD)
rm -rf dist && cp -R app dist
sed -i '' "s/__BUILD_SHA__/$SHA/g" dist/index.html
# Recordings are not part of the build: copied in beside it so the host serves them as files.
[ -d media ] && cp -R media dist/media
echo "$SHA"

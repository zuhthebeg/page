#!/usr/bin/env bash
# page.cocy.io 배포: git HEAD 전체 트리를 clean export → 메인 feed.json 재생성 → wrangler 배포.
# 작업트리의 미커밋 변경은 배포되지 않는다(커밋 먼저). 사용: scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=$(pwd)
OUT=$(mktemp -d /tmp/page-deploy.XXXXXX)
trap 'rm -rf "$OUT"' EXIT

git archive HEAD | tar -x -C "$OUT"
[ -d node_modules ] && ln -s "$REPO/node_modules" "$OUT/node_modules"
node scripts/gen-feed.cjs --out "$OUT/public/feed.json" --private-out "$OUT/functions/api/_private-feed.json"
cd "$OUT"
npx wrangler pages deploy public --project-name page-cocy --branch main --commit-dirty=true
curl -fsS -o /dev/null -w 'api/sites %{http_code}\n' https://page.cocy.io/api/sites

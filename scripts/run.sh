#!/usr/bin/env bash
# SwimVault — 1커맨드 로컬 기동기.
#   사용법:  scripts/run.sh [dev|live] [--no-frontend] [--no-extraction]
#   - config/<mode>.env 를 로드하고 모든 서비스를 백그라운드로 띄운다.
#   - 각 서비스 로그는 logs/<service>.log 로, 프론트엔드→게이트웨이→서비스까지
#     하나의 폴더에서 추적 가능하다(게이트웨이 접근 로그에 x-request-id 포함).
#   - 중지: scripts/stop.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:-dev}"
shift || true
WITH_FRONTEND=1
WITH_EXTRACTION=1
for arg in "$@"; do
  case "$arg" in
    --no-frontend) WITH_FRONTEND=0 ;;
    --no-extraction) WITH_EXTRACTION=0 ;;
  esac
done

CONFIG="config/${MODE}.env"
[ -f "$CONFIG" ] || { echo "❌ 설정 파일 없음: $CONFIG (mode=dev|live)"; exit 1; }

echo "▶ SwimVault 기동 — mode=$MODE"
set -a; # shellcheck disable=SC1090
source "$CONFIG"; set +a

mkdir -p logs .run
: > logs/_run.log
echo "$(date -u +%FT%TZ) run start mode=$MODE" >> logs/_run.log

# 공유 계약 빌드 (런타임 값 import: gamification levelForXp 등에 필요)
echo "• libs/contracts 빌드"
( cd libs/contracts && [ -d node_modules ] || npm install --silent; npm run build --silent )

# 노드 서비스 기동 헬퍼:  start_node <dir> <PORT>
start_node() {
  local dir="$1" port="$2" name; name="$(basename "$dir")"
  echo "• $name  → :$port  (logs/$name.log)"
  ( cd "services/$dir" && [ -d node_modules ] || npm install --silent )
  ( cd "services/$dir" && PORT="$port" exec npx tsx src/index.ts ) \
    > "logs/$name.log" 2>&1 &
  echo $! >> .run/pids
}

: > .run/pids

start_node auth-service        "$AUTH_PORT"
start_node athlete-service     "$ATHLETE_PORT"
start_node ingestion-service   "$INGESTION_PORT"
start_node records-service     "$RECORDS_PORT"
start_node standards-service   "$STANDARDS_PORT"
start_node analytics-service   "$ANALYTICS_PORT"
start_node gamification-service "$GAMIFICATION_PORT"
start_node family-service      "$FAMILY_PORT"
start_node api-gateway         "$GATEWAY_PORT"

# 추출 서비스 (Python/FastAPI) — 선택
if [ "$WITH_EXTRACTION" = "1" ]; then
  if command -v python3 >/dev/null; then
    echo "• extraction-service → :$EXTRACTION_PORT (logs/extraction-service.log)"
    ( cd services/extraction-service \
      && (pip install -q -e . >/dev/null 2>&1 || true) \
      && PORT="$EXTRACTION_PORT" exec python3 -m uvicorn app.main:app --host 0.0.0.0 --port "$EXTRACTION_PORT" ) \
      > logs/extraction-service.log 2>&1 &
    echo $! >> .run/pids
  else
    echo "⚠ python3 없음 — extraction-service 건너뜀"
  fi
fi

# 프론트엔드 — 선택
if [ "$WITH_FRONTEND" = "1" ]; then
  echo "• frontend → :$FRONTEND_PORT (logs/frontend.log)"
  ( cd frontend && [ -d node_modules ] || npm install --silent )
  ( cd frontend && VITE_API_BASE="$VITE_API_BASE" exec npx vite --port "$FRONTEND_PORT" --host ) \
    > logs/frontend.log 2>&1 &
  echo $! >> .run/pids
fi

echo ""
echo "✅ 기동 완료. 게이트웨이: http://localhost:${GATEWAY_PORT}/health"
[ "$WITH_FRONTEND" = "1" ] && echo "   프론트엔드: http://localhost:${FRONTEND_PORT}"
echo "   로그:   tail -f logs/*.log"
echo "   중지:   scripts/stop.sh"

#!/usr/bin/env bash
# SwimVault — 1커맨드 로컬 기동기.
#   사용법:  scripts/run.sh [dev|live] [--no-frontend] [--no-extraction]
#   중지:    scripts/stop.sh
#   상태:    scripts/stop.sh --status
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:-dev}"
shift || true
WITH_FRONTEND=1
WITH_EXTRACTION=1
for arg in "$@"; do
  case "$arg" in
    --no-frontend)   WITH_FRONTEND=0 ;;
    --no-extraction) WITH_EXTRACTION=0 ;;
  esac
done

CONFIG="config/${MODE}.env"
[ -f "$CONFIG" ] || { echo "❌ 설정 파일 없음: $CONFIG (mode=dev|live)"; exit 1; }

echo "▶ SwimVault 기동 — mode=$MODE"
set -a
# shellcheck disable=SC1090
source "$CONFIG"
set +a

mkdir -p logs .run
: > .run/pids   # 기존 PID 목록 초기화

# ── 공유 계약 빌드 ─────────────────────────────────────────
echo "• libs/contracts 빌드"
( cd libs/contracts && [ -d node_modules ] || npm install --silent; npm run build --silent )

# ── 헬퍼: Node 서비스 기동 ─────────────────────────────────
start_node() {
  local dir="$1" port="$2"
  local name; name="$(basename "$dir")"
  echo "• $name → :$port"
  ( cd "services/$dir" && [ -d node_modules ] || npm install --silent )
  # 서브셸에서 exec → $! 가 tsx PID. setsid로 독립 세션 → stop 시 자식까지 정리.
  setsid bash -c "cd '$ROOT/services/$dir' && PORT=$port exec npx tsx src/index.ts" \
    > "logs/$name.log" 2>&1 &
  echo $! >> .run/pids
}

# ── 헬퍼: 헬스 체크 대기 ──────────────────────────────────
wait_healthy() {
  local port="$1" name="$2" i
  for i in $(seq 1 30); do
    if curl -sf "http://localhost:$port/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "  ⚠ $name(:$port) 응답 없음 — logs/$name.log 확인"
  return 1
}

# ── Node 서비스 기동 ───────────────────────────────────────
start_node auth-service         "$AUTH_PORT"
start_node athlete-service      "$ATHLETE_PORT"
start_node ingestion-service    "$INGESTION_PORT"
start_node records-service      "$RECORDS_PORT"
start_node standards-service    "$STANDARDS_PORT"
start_node analytics-service    "$ANALYTICS_PORT"
start_node gamification-service "$GAMIFICATION_PORT"
start_node family-service       "$FAMILY_PORT"

# ── Extraction 서비스 (Python/FastAPI) ────────────────────
if [ "$WITH_EXTRACTION" = "1" ]; then
  if command -v python3 >/dev/null 2>&1; then
    echo "• extraction-service → :$EXTRACTION_PORT"
    VENV="services/extraction-service/.venv"
    # venv 없으면 생성 (1회)
    if [ ! -f "$VENV/bin/python" ]; then
      echo "  → venv 생성 중…"
      python3 -m venv "$VENV" >/dev/null 2>&1
      "$VENV/bin/pip" install -q -e services/extraction-service >/dev/null 2>&1
    fi
    setsid bash -c "
      source '$ROOT/$VENV/bin/activate'
      cd '$ROOT/services/extraction-service'
      exec uvicorn app.main:app --host 0.0.0.0 --port $EXTRACTION_PORT
    " > logs/extraction-service.log 2>&1 &
    echo $! >> .run/pids
  else
    echo "⚠ python3 없음 — extraction-service 건너뜀"
  fi
fi

# ── 게이트웨이 (Node 서비스들이 먼저 올라온 뒤) ─────────────
start_node api-gateway "$GATEWAY_PORT"

# ── 프론트엔드 ────────────────────────────────────────────
if [ "$WITH_FRONTEND" = "1" ]; then
  echo "• frontend → :$FRONTEND_PORT"
  ( cd frontend && [ -d node_modules ] || npm install --silent )
  setsid bash -c "
    cd '$ROOT/frontend'
    VITE_API_BASE='$VITE_API_BASE' VITE_USE_MOCK='${VITE_USE_MOCK:-true}' \
      exec npx vite --port $FRONTEND_PORT --host
  " > logs/frontend.log 2>&1 &
  echo $! >> .run/pids
fi

# ── 헬스 체크 ─────────────────────────────────────────────
echo ""
echo "⏳ 서비스 기동 확인 중…"
wait_healthy "$AUTH_PORT"         "auth-service"
wait_healthy "$ATHLETE_PORT"      "athlete-service"
wait_healthy "$RECORDS_PORT"      "records-service"
wait_healthy "$FAMILY_PORT"       "family-service"
wait_healthy "$GAMIFICATION_PORT" "gamification-service"
wait_healthy "$STANDARDS_PORT"    "standards-service"
wait_healthy "$ANALYTICS_PORT"    "analytics-service"
wait_healthy "$INGESTION_PORT"    "ingestion-service"
wait_healthy "$GATEWAY_PORT"      "api-gateway"

echo ""
echo "✅ 기동 완료"
echo "   게이트웨이:   http://localhost:${GATEWAY_PORT}/health"
[ "$WITH_FRONTEND" = "1" ] && echo "   프론트엔드:   http://localhost:${FRONTEND_PORT}"
echo ""
echo "   로그 보기:    tail -f logs/*.log"
echo "   서비스 중지:  scripts/stop.sh"

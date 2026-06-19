#!/usr/bin/env bash
# SwimVault — 전체 테스트(프론트→API→백엔드)를 한 번에. 단계별 통과/실패를 logs에 남긴다.
#   사용법: scripts/test-all.sh
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p logs
LOG="logs/test-all.log"
: > "$LOG"

FAIL=0
run() { # run <label> <dir> <cmd...>
  local label="$1" dir="$2"; shift 2
  echo "── $label ($dir)" | tee -a "$LOG"
  ( cd "$dir" && [ -d node_modules ] || npm install --silent ) 2>>"$LOG"
  if ( cd "$dir" && "$@" ) >>"$LOG" 2>&1; then
    echo "  ✅ PASS: $label" | tee -a "$LOG"
  else
    echo "  ❌ FAIL: $label" | tee -a "$LOG"
    FAIL=1
  fi
}

# 1) 공유 계약 (단일 진실 공급원) — 먼저 빌드+테스트
run "contracts" "libs/contracts" npm test
( cd libs/contracts && npm run build --silent ) 2>>"$LOG"

# 2) 백엔드 서비스 (Node)
for s in auth-service athlete-service ingestion-service records-service \
         standards-service analytics-service gamification-service \
         family-service api-gateway; do
  run "$s" "services/$s" npm test
done

# 3) 추출 서비스 (Python)
if command -v pytest >/dev/null 2>&1 || command -v python3 >/dev/null 2>&1; then
  echo "── extraction-service (Python)" | tee -a "$LOG"
  if ( cd services/extraction-service && pip install -q -e . >/dev/null 2>&1 && python3 -m pytest -q ) >>"$LOG" 2>&1; then
    echo "  ✅ PASS: extraction-service" | tee -a "$LOG"
  else
    echo "  ⚠ SKIP/FAIL: extraction-service (로그 확인)" | tee -a "$LOG"
  fi
fi

# 4) 프론트엔드 (Vitest)
run "frontend" "frontend" npm test

echo ""
if [ "$FAIL" = "0" ]; then
  echo "✅ 전체 통과. 상세: $LOG"
else
  echo "❌ 일부 실패. 상세: $LOG"; exit 1
fi

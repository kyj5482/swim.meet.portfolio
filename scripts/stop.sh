#!/usr/bin/env bash
# SwimVault — run.sh 로 띄운 모든 서비스를 중지.
#   사용법:  scripts/stop.sh [--status]
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# --status: PID별 생존 여부만 출력
if [ "${1:-}" = "--status" ]; then
  if [ ! -f .run/pids ]; then
    echo "실행 기록 없음 (.run/pids)"
    exit 0
  fi
  echo "서비스 상태:"
  SERVICES=(
    "auth-service:8081"
    "athlete-service:8082"
    "ingestion-service:8083"
    "extraction-service:8084"
    "records-service:8085"
    "standards-service:8086"
    "analytics-service:8087"
    "gamification-service:8088"
    "family-service:8089"
    "api-gateway:8080"
    "frontend:5173"
  )
  for entry in "${SERVICES[@]}"; do
    name="${entry%%:*}"
    port="${entry##*:}"
    if curl -sf "http://localhost:$port/health" >/dev/null 2>&1; then
      echo "  ✅ $name (:$port)"
    else
      # frontend는 /health 없으므로 루트로 체크
      if curl -sf "http://localhost:$port/" >/dev/null 2>&1; then
        echo "  ✅ $name (:$port)"
      else
        echo "  ⬜ $name (:$port) — 응답 없음"
      fi
    fi
  done
  exit 0
fi

if [ ! -f .run/pids ]; then
  echo "중지할 프로세스 기록(.run/pids) 없음."
  exit 0
fi

echo "⏹ SwimVault 서비스 중지 중…"
while read -r pid; do
  [ -n "$pid" ] || continue
  if kill -0 "$pid" 2>/dev/null; then
    # setsid로 기동했으므로 세션 리더(pid)를 죽이면 자식까지 정리됨
    kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  fi
done < .run/pids

# 잔여 프로세스 강제 정리 (2초 후)
sleep 2
pkill -f "tsx src/index.ts" 2>/dev/null || true
pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "vite --port" 2>/dev/null || true

rm -f .run/pids
echo "✅ 모두 중지."

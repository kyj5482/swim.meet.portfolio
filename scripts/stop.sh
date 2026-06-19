#!/usr/bin/env bash
# SwimVault — run.sh로 띄운 모든 서비스를 중지.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ ! -f .run/pids ]; then
  echo "중지할 프로세스 기록(.run/pids) 없음."
  exit 0
fi

while read -r pid; do
  [ -n "$pid" ] || continue
  if kill -0 "$pid" 2>/dev/null; then
    # 자식까지 정리: 프로세스 그룹 종료 시도 후 개별 종료
    kill "$pid" 2>/dev/null || true
    echo "• 중지 pid=$pid"
  fi
done < .run/pids

rm -f .run/pids
echo "✅ 모두 중지."

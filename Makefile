.PHONY: dev dev-frontend stop status test logs

# 전체 기동 (Node 백엔드 8개 + Python extraction + 프론트엔드)
dev:
	scripts/run.sh dev

# 프론트엔드만 (백엔드 불필요, mock 모드)
dev-frontend:
	cd frontend && npm install --silent && npx vite --port 5173 --host

# extraction-service 제외하고 기동 (Python 없는 환경)
dev-no-py:
	scripts/run.sh dev --no-extraction

# 모든 서비스 중지
stop:
	scripts/stop.sh

# 실행 중인 서비스 헬스 체크
status:
	scripts/stop.sh --status

# 전체 테스트 (프론트 + 백엔드 전부)
test:
	scripts/test-all.sh

# 실시간 로그 스트리밍
logs:
	tail -f logs/*.log

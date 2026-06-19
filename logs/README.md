# logs/

`scripts/run.sh`가 각 서비스 출력을 이 폴더로 수집한다. (`*.log`는 git 무시)

| 파일 | 내용 |
|------|------|
| `_run.log` | 기동 메타(시작 시각·모드) |
| `api-gateway.log` | **추적 시작점** — 모든 외부 요청의 구조화 접근 로그(JSON) |
| `<service>.log` | 각 서비스 stdout/stderr |
| `test-all.log` | `scripts/test-all.sh` 단계별 결과 |
| `frontend.log` | Vite 개발 서버 |

## 프론트엔드 → 백엔드 추적 (x-request-id)

게이트웨이는 단일 진입점이라 추적의 시작점이다.

1. 프론트엔드가 요청에 `x-request-id` 헤더를 넣으면 게이트웨이가 그대로 이어받고,
   없으면 새로 발급해 응답 헤더로 돌려준다. (`api-gateway/src/logging.ts`)
2. 게이트웨이 접근 로그는 한 줄 JSON: `{t, svc, reqId, method, path, status, ms}`.
3. 하나의 흐름을 추적하려면 그 `reqId`로 grep:

   ```bash
   grep <reqId> logs/*.log
   ```

> 로드맵: 게이트웨이가 다운스트림 호출 시 `x-request-id`를 전파하고,
> 각 서비스도 같은 형식의 구조화 로그를 남기면 한 reqId로 전 구간이 이어진다.

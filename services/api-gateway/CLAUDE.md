# api-gateway (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
외부 진입점. 경로 프리픽스 기반 **라우팅 + 실제 프록시 전달**, **Bearer 인증 검증**(파사드),
요청 추적(`x-request-id`)을 다운스트림으로 전파. JWT 서명 검증(현재는 토큰 존재만)은 후속.

## 스택
Node + TypeScript + Express. 테스트는 Jest(ESM). 전달은 내장 `fetch`(외부 의존 없음).

## 구조
| 파일 | 역할 |
|------|------|
| `src/proxy.ts` | resolveTarget/verifyBearer + **buildTargetUrl/forwardHeaders(순수)** + `forward`(fetch 전달) |
| `src/routes.ts` | 캐치올: 404 → 401 가드 → **업스트림 프록시 전달** |
| `src/logging.ts` | `x-request-id` 부여 + 구조화 접근 로그(추적 시작점) |
| `src/index.ts` | Express 부트스트랩, `GET /health` |

## 규칙
- 업스트림 URL은 환경변수(`*_SERVICE_URL`)에서 읽고 기본값은 도커 호스트명.
- `/api/auth`는 공개 프리픽스, 그 외는 Bearer 필요.
- 프록시는 JSON 본문만 재직렬화(우리 API는 JSON). 멀티파트 업로드 프록시는 후속 과제.
- 업스트림 도달 실패 시 502(BAD_GATEWAY). hop-by-hop 헤더는 제거하고 x-request-id는 전파.
- 도메인 타입은 `@swimvault/contracts`에서만 가져온다. (R3)

## 테스트
`npm test` — 프리픽스 매핑·Bearer 보호 + buildTargetUrl/forwardHeaders 순수 검증.
라이브 검증: 다운스트림 서비스 기동 후 게이트웨이 경유 curl(404/401/전달/추적).

## API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/health` | 헬스체크 |
| ALL | `/api/*` | 보호 경로 Bearer 필요 → 해석된 업스트림으로 실제 프록시 전달 |

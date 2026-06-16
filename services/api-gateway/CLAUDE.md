# api-gateway (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
외부 진입점. 경로 프리픽스 기반 **라우팅**과 **Bearer 인증 검증**(파사드).
실제 프록시 전달과 JWT 검증은 골격 이후(M1).

## 스택
Node + TypeScript + Express + Zod. 테스트는 Jest(ESM).

## 구조
| 파일 | 역할 |
|------|------|
| `src/proxy.ts` | **resolveTarget / verifyBearer 순수 로직** (테스트 핵심) |
| `src/routes.ts` | 캐치올 라우트(해석 결과 JSON 스텁) + 401 가드 |
| `src/index.ts` | Express 부트스트랩, `GET /health` |

## 규칙
- 업스트림 URL은 환경변수(`*_SERVICE_URL`)에서 읽고 기본값은 도커 호스트명.
- `/api/auth`는 공개 프리픽스, 그 외는 Bearer 필요.
- 도메인 타입은 `@swimvault/contracts`에서만 가져온다. (R3)
- 실제 JWT 검증/프록시 전달은 M1.

## 테스트
`npm test` — `proxy.test.ts`가 프리픽스별 매핑·미지정 null·Bearer 존재/부재 보호.

## API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/health` | 헬스체크 |
| ALL | `/api/*` | 해석된 업스트림 대상 JSON 반환(스텁), 보호 경로는 Bearer 필요 |

# athlete-service (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
자녀 **선수(Athlete) 프로필** CRUD. 부모(parentId) **소유권 강제**.

## 스택
Node + TypeScript + Express + Zod. 테스트는 Jest(ESM).

## 구조
| 파일 | 역할 |
|------|------|
| `src/service.ts` | create/list/get/update + **assertOwner** 소유권 검증(테스트 핵심) |
| `src/repository.ts` | 스토리지 추상화(인메모리 기본) |
| `src/routes.ts` | `/api/athletes` 엔드포인트 (얇게) |
| `src/index.ts` | Express 부트스트랩, `GET /health` |

## 규칙
- **프라이버시(P6): 모든 조회/수정은 소유 부모(parentId)로 스코프**. 타 부모 접근은 403.
- 골격에서 parentId는 `x-parent-id` 헤더에서 주입(스텁). 실제로는 게이트웨이 JWT에서(M1).
- 도메인 타입은 `@swimvault/contracts`에서만 가져온다. (R3)

## 테스트
`npm test` — `service.test.ts`가 생성→조회·부모별 스코프·타 부모 403·`assertOwner` 보호.

## API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/athletes` | 선수 생성(소유 부모) |
| GET | `/api/athletes` | 본인 소유 선수 목록 |
| GET | `/api/athletes/:id` | 단건 조회(소유권 검증) |
| PATCH | `/api/athletes/:id` | 부분 수정(소유권 검증) |

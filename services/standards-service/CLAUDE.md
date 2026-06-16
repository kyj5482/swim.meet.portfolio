# standards-service (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
USAS/커스텀 **기준 기록(Standard) 매칭** — 성별/연령/영법/거리/코스로 필터, 달성 여부 판정.

## 스택
Node + TypeScript + Express + Zod. 테스트는 Jest(ESM).

## 구조
| 파일 | 역할 |
|------|------|
| `src/match.ts` | **연령 계산·기준 매칭·달성 판정 순수 로직** (테스트 핵심) |
| `src/service.ts` | 매칭 조회 + 커스텀 기준 등록 오케스트레이션 |
| `src/repository.ts` | 스토리지 추상화(인메모리 기본) |
| `src/routes.ts` | `/api/standards` 엔드포인트 (얇게) |
| `src/index.ts` | Express 부트스트랩 |

## 규칙
- 시간은 항상 `timeMs`(밀리초 정수). 표시 변환은 `@swimvault/contracts`의 `formatMsToTime`.
- 연령 경계는 `[ageMin, ageMax]` inclusive. 달성은 `timeMs <= standard.timeMs`(컷 이하).
- 도메인 타입은 `@swimvault/contracts`에서만 가져온다. (R3)

## 테스트
`npm test` — `match.test.ts`가 연령 경계(min/max inclusive·외부 제외), 성별/영법/거리/코스 필터, 정렬, 달성 경계(at/under/over), 생일 미도래 케이스를 보호.

## API
- `GET /api/standards/match?gender=&age=&stroke=&distance=&course=` — 매칭된 기준(timeMs 오름차순)
- `POST /api/standards/custom` — 커스텀 기준 등록
- 상세는 `docs/03-api-contracts.md`의 standards 섹션 참조.

# analytics-service (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
선수 기록의 **진척도 추이**, 이전 PB 대비 **개선율(%)**, **스플릿 분석**(네거티브 스플릿 판정 포함).

## 스택
Node + TypeScript + Express + Zod. 테스트는 Jest(ESM).

## 구조
| 파일 | 역할 |
|------|------|
| `src/improvement.ts` | **개선율/진척도/스플릿 순수 로직** (테스트 핵심) |
| `src/service.ts` | 조회 + 분석 오케스트레이션 |
| `src/repository.ts` | 스토리지 추상화(인메모리 기본) |
| `src/routes.ts` | `/api/analytics` 엔드포인트 (얇게) |
| `src/index.ts` | Express 부트스트랩 |

## 규칙
- 시간은 항상 `timeMs`(밀리초 정수). 표시 변환은 `@swimvault/contracts`의 `formatMsToTime`.
- 개선율은 빠를수록(작을수록) 양수. `(previousMs - currentMs) / previousMs * 100`, 소수 2자리.
- 도메인 타입은 `@swimvault/contracts`에서만 가져온다. (R3)

## 테스트
`npm test` — `improvement.test.ts`가 개선율 부호/반올림/RangeError, 스플릿 fastest·slowest·네거티브 스플릿·빈 배열을 보호.

## API
- `GET /api/analytics/athletes/:id/progress` — 진척도 시리즈
- `GET /api/analytics/athletes/:id/splits/:raceId` — 스플릿 분석
- 상세는 `docs/03-api-contracts.md`의 analytics 섹션 참조.

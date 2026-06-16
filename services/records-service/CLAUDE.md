# records-service (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
확정된 경주 기록(RaceResult)·스플릿 적재, **PB 판정**, 기록부 조회.

## 스택
Node + TypeScript + Express + Zod. 테스트는 Jest(ESM).

## 구조
| 파일 | 역할 |
|------|------|
| `src/pb.ts` | **PB 판정 순수 로직** (테스트 핵심) |
| `src/service.ts` | 적재 + PB 강등 오케스트레이션 |
| `src/repository.ts` | 스토리지 추상화(인메모리 기본) |
| `src/routes.ts` | `/api/records` 엔드포인트 (얇게) |
| `src/index.ts` | Express 부트스트랩 |

## 규칙
- 시간은 항상 `timeMs`(밀리초 정수). 표시 변환은 `@swimvault/contracts`의 `formatMsToTime`.
- PB는 (선수·종목·거리·코스)별. 코스가 다르면 별개 PB.
- 도메인 타입은 `@swimvault/contracts`에서만 가져온다. (R3)

## 테스트
`npm test` — `pb.test.ts`가 PB 경계 케이스 보호(최초/동률/코스분리/강등).

## API
`docs/03-api-contracts.md`의 records 섹션 참조.

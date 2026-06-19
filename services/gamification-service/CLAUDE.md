# gamification-service (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
선수의 **행동 → XP → 레벨/스트릭/뱃지** 게임 루프. 리텐션의 핵심 엔진.
"내 수준이 몇 단계인지"(레벨)와 "계속 들어올 이유"(스트릭·뱃지·가족 리더보드)를 제공.

## 경계 (R1)
- 실력 티어(USAS A/AA 등) 매핑은 **standards-service** 소관. 여기는 게임 루프만.
- 다른 서비스가 이벤트를 발생시키고(예: records가 PB 달성 시) 여기서 집계한다.
  골격에서는 REST `POST /events`, 이후 메시지 큐(`game.event`)로 진화.

## 스택
Node + TypeScript + Express + Zod. 테스트 Jest(ESM).

## 구조
| 파일 | 역할 |
|------|------|
| `src/xp.ts` | **행동→XP 규칙** (순수, 테스트 핵심) |
| `src/streak.ts` | **연속 활동일 계산** (순수, 테스트 핵심) |
| `src/badges.ts` | **뱃지 달성 규칙** (순수, 테스트 핵심) |
| `src/service.ts` | 이벤트 적재 + 프로필 집계 + 가족 리더보드 |
| `src/repository.ts` | 이벤트 저장 추상화(append-only, 인메모리 기본) |
| `src/routes.ts` | `/api/gamification` 엔드포인트 (얇게) |
| `src/index.ts` | Express 부트스트랩, `GET /health`, 기본 :8088 |

## 규칙
- 레벨 곡선(`levelForXp`/`xpForLevel`)은 프론트도 쓰므로 `@swimvault/contracts`에 있다. 여기서 import.
- XP·뱃지·스트릭 규칙을 바꿀 땐 해당 순수 함수 + 테스트만 수정하면 된다.
- 도메인 타입은 `@swimvault/contracts`에서만 가져온다. (R3)

## API (`/api/gamification`)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/events` | `{athleteId, type, at?, meta?}` → 갱신된 프로필 |
| GET | `/athletes/:id` | 게임화 프로필(XP·레벨·스트릭·뱃지) |
| POST | `/leaderboard` | `{athleteIds[]}` → 가족 내 XP 순위 |

## 테스트
`npm test` — xp/streak/badges 순수 규칙 + service 집계·격리·리더보드.

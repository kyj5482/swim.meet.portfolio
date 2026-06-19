# 게임화 & 스킬 레벨 (Gamification)

작성: app-planner + backend-dev · 구현: `services/gamification-service`, 계약: `libs/contracts/src/gamification.ts`

## 1. 왜 (제품 목표)

수영에서 중요한 두 질문에 답한다:
1. **"내 실력이 얼마나 늘고 있나?"** → 향상%·PB(records/analytics) + XP 보너스로 보상.
2. **"(선수가 아니어도) 내 수준이 몇 단계인가?"** → **보편 레벨**로 누구나 단계를 안다.

그리고 **계속 들어올 이유**(리텐션)를 만든다: 레벨업·스트릭·뱃지·가족 리더보드.

## 2. 게임 루프

```
행동(다른 서비스가 발생) → GameEvent → XP 적립 → 레벨/스트릭/뱃지 갱신 → 프론트 표시
```

- 이벤트 발생원: records(기록 적재/PB), athlete/records(새 거리·영법), 활동일 등.
- 골격: REST `POST /api/gamification/events`. 이후 메시지 큐(`game.event`)로 진화.
- gamification-service는 **집계만** 책임. 실력 티어(USAS A/AA)는 standards-service. (R1)

## 3. XP 규칙 (`services/gamification-service/src/xp.ts`)

| 행동(type) | XP | 의도 |
|-----------|----|------|
| `race_logged` | 10 | 기록을 쌓는 습관 |
| `pb_achieved` | 25 + min(향상%, 25) | **더 빨라지는 재미**를 가장 크게 보상 |
| `distance_milestone` | 50 | 새 거리 도전 |
| `stroke_unlocked` | 40 | 새 영법 개척 |
| `streak_day` | 5 | 매일 들어오기 |

## 4. 레벨 곡선 (`libs/contracts/src/gamification.ts` — 프론트와 공유)

`xpForLevel(n) = 50·(n-1)·n` → L1:0, L2:100, L3:300, L4:600, L5:1000 …
초반 완만(유입), 후반 가팔라짐(장기 리텐션). `levelForXp(xp)`가 레벨·구간 진행도를 반환 →
프론트 진행바와 백엔드 계산이 **같은 곡선**을 쓴다.

## 5. 스트릭 (`src/streak.ts`)
- 활동일을 UTC 날짜로 정규화·중복 제거 후 연속일 계산.
- `current`: 최근 활동일이 오늘/어제와 닿아 있을 때만 살아있음(끊기면 0).
- `longest`: 역대 최장. → "강철 의지" 뱃지(7일) 등과 연결.

## 6. 뱃지 (`src/badges.ts`)
| code | 조건 |
|------|------|
| `first_splash` | 첫 기록 |
| `pb_machine` | PB 5회 |
| `all_four_strokes` | 서로 다른 4영법 unlock |
| `distance_explorer` | 서로 다른 5개 거리 |
| `centurion` | 기록 100건 |
| `iron_will` | 최장 스트릭 7일+ |

## 7. 가족 리더보드
`POST /leaderboard {athleteIds[]}` → XP 내림차순 순위. 가족 멤버십은 family-service가 알고,
점수만 여기서 책임(R1). 형제·자매 사이 선의의 경쟁 = 리텐션 훅.

## 8. 로드맵
- (M2) records→gamification 자동 이벤트 발행(PB 달성 시 향상% 동봉).
- (M2) "배우는 단계" 스킬 트리(Swim England Stage 1~7 / Red Cross 매핑)를 standards-service의
  비시간 기준으로 추가 → 레벨과 별개의 **스킬 배지 트랙**.
- (M3) 시즌 목표·주간 챌린지.

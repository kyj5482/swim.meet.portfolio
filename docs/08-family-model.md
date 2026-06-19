# 가족 모델 (Family Model)

작성: app-planner + backend-dev · 구현: `services/family-service`, 계약: `libs/contracts/src/family.ts`

## 1. 왜
부모(보호자)와 수영 학생 본인이 **모두 업로드**하고, 이를 **하나의 가족**에서 관리하며,
학생이 **평생 포트폴리오**를 이어 쌓는다(P4). 기존 `parentId` 소유 모델(P6)을 깨지 않고
그 위에 "가족"이라는 묶음을 더한다.

## 2. 엔티티 (`libs/contracts/src/family.ts`)
- **Family** `{ id, name, createdBy, members[], athleteIds[], createdAt }`
- **FamilyMember** `{ userId, role: 'guardian'|'swimmer', athleteId?, joinedAt }`
- **FamilyInvite** `{ code, familyId, role, expiresAt }` — 1회용·7일 만료

역할:
- `guardian` — 부모/코치 등 보호자. 가족 생성자는 자동 guardian.
- `swimmer` — 수영 학생 본인 계정. 나이가 되면 직접 업로드하며 자신의 `athleteId`와 연결.

한 athlete(선수 프로필)는 정확히 한 가족에 속한다(`athleteIds`로 묶음).

## 3. 합류 플로우
```
보호자: 가족 생성 → swimmer 초대 코드 발급 → 코드 공유
학생:   코드 수락(userId, athleteId?) → 가족 멤버 + 선수 연결 (멱등, 코드는 1회 소멸)
```

## 4. 책임 경계 (R1)
- 인증/계정 = **auth-service**, 선수 프로필 CRUD = **athlete-service**.
- family-service는 "누가 어느 가족인가 + 어떤 선수가 그 가족 것인가"만.
- 가족 내 게임 순위 = athleteIds를 **gamification-service** `/leaderboard`로 전달.

## 5. 프라이버시 (P6)
- 가족 외부에서 다른 아이를 검색할 수 있는 인덱스는 만들지 않는다.
- 초대 코드는 혼동 문자 제외 8자리, 1회용, 7일 만료. 운영에서는 발급자 권한 검증을 게이트웨이/auth와 연동.

## 6. 로드맵
- (M2) athlete-service와 연계: 가족 생성 시 기존 parent의 athlete들을 자동 귀속.
- (M2) 멤버 권한(보호자만 초대/삭제) — JWT 클레임 기반 게이트웨이 가드.
- (M3) 가족 공유 타임라인(여러 자녀의 기록·뱃지·레벨을 한 화면에).

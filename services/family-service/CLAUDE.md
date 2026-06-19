# family-service (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
**가족 단위 관리.** 보호자(guardian)와 수영 학생(swimmer)을 하나의 가족으로 묶고,
선수 프로필(athleteId)들을 가족에 연결한다. 초대 코드로 멤버를 추가한다.

부모/학생 누구나 업로드하고, 한 가족에서 평생 포트폴리오를 함께 쌓는다는
핵심 요구를 떠받친다. 기존 parentId 소유 모델(P6)을 깨지 않고 그 위에 묶음을 더한다.

## 경계 (R1)
- 인증/계정은 **auth-service**, 선수 프로필 CRUD는 **athlete-service** 소관.
  여기는 "누가 어느 가족인가 + 어떤 선수가 그 가족 것인가"만 책임.
- 가족 내 게임 순위는 **gamification-service** `/leaderboard`에 athleteIds를 넘겨 받는다.

## 스택
Node + TypeScript + Express + Zod. 테스트 Jest(ESM).

## 구조
| 파일 | 역할 |
|------|------|
| `src/invite.ts` | **초대 코드 생성/만료 순수 헬퍼** (테스트 핵심) |
| `src/service.ts` | 가족 생성·멤버·선수 연결·초대 수락(멱등/1회용) |
| `src/repository.ts` | 가족·초대 저장 추상화(인메모리 기본) |
| `src/routes.ts` | `/api/families` 엔드포인트 (얇게) |
| `src/index.ts` | Express 부트스트랩, `GET /health`, 기본 :8089 |

## 규칙
- 멤버 역할: `guardian`(보호자) / `swimmer`(학생 본인).
- 선수 추가·멤버 추가는 멱등. 초대 코드는 1회용 + 7일 만료.
- 도메인 타입은 `@swimvault/contracts`에서만 가져온다. (R3)

## API (`/api/families`)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/` | `{name, createdBy}` → 가족 생성(생성자=guardian) |
| GET | `/?userId=` | 내가 속한 가족 목록 |
| GET | `/:id` | 가족 단건 |
| POST | `/:id/athletes` | `{athleteId}` 선수 연결 |
| POST | `/:id/invites` | `{role}` → 초대 코드 |
| POST | `/invites/:code/accept` | `{userId, athleteId?}` → 합류 |

## 테스트
`npm test` — invite 헬퍼 + service(생성/멱등/초대 1회용/소속 필터).

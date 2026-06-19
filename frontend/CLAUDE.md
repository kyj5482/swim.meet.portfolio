# frontend — SwimVault 웹/PWA (React + Vite + TS)

> 이 파일은 frontend 서비스만의 컨텍스트 요약이다(설계 R2). AI 수정 시 이 디렉터리만 읽으면 된다.

## 책임

부모(보호자)·수영 학생용 모바일 앱(웹/PWA, iOS는 Capacitor 래핑 예정). 인증 게이트 +
하단 4탭 셸: **포트폴리오 / 기록 추가 / 가족 / 설정**.

1. **포트폴리오(핵심)** — 선수가 평생 쌓는 기록부를 한 화면에. 경쟁 앱(Swimmetry) 벤치마킹 +
   레벨/뱃지/스트릭(게임화)·나이 그룹별 분석·가족 리더보드로 차별화.
2. **기록 추가(가장 중요)** — 결과지를 ① 사진 ② 이메일로 입력 → 추출 → **등록된 아이만 매칭** →
   ★ 검증·수정(P2) → 확정. 등록 외 선수 기록은 저장하지 않음(P6).
3. **가족** — 구성원/선수 목록, 아이 추가, 가족 초대 코드.
4. **설정** — 언어(한/영) 전환, 계정/로그아웃.

서비스 직접 호출 없이 `api-gateway`(REST)만 통한다. API 계약은 `docs/03-api-contracts.md`.
모든 데이터는 `src/api/*`만 의존 — 기본은 mock(자립), `VITE_USE_MOCK=false`면 실서버.

## 디자인
UI/UX를 바꾸기 전·후 **`docs/10-design-guide.md`를 보고 갱신**한다. 색/간격/반경은
`styles.css`의 `:root` **토큰(var)으로만** 사용(하드코딩 금지). 단일 강조색(아쿠아 블루),
등급은 단색 강도 램프, 그래프는 방향 라벨·격자·면적으로 직관화(Meet Mobile식 명료함).

## 스택

- React 18 + Vite + TypeScript (모바일 PWA, iOS Capacitor 지향)
- 다국어: `src/i18n` (ko/en, localStorage 영속, navigator 자동감지)
- 인증: `src/auth/AuthContext` (token/user localStorage, mock/실서버)
- 테스트: Vitest + @testing-library/react (jsdom). `setupTests.ts`가 afterEach cleanup.
- 독립 패키지로 빌드 → 공유 타입/유틸은 `@swimvault/contracts`를 **로컬 미러링**.

## 구조

```
src/
  main.tsx                  엔트리: I18nProvider → AuthProvider → App
  App.tsx                   인증 게이트 + 하단 4탭 셸
  types.ts                  도메인 타입 + RosterAthlete/ExtractedRow (contracts 미러)
  i18n/                     index.tsx(Provider/useI18n/t) + ko.ts + en.ts
  auth/AuthContext.tsx      user/token 상태, login/register/logout
  api/
    config.ts               API_BASE / USE_MOCK / apiFetch(x-request-id·Bearer)
    client.ts               getPortfolio() — mock(시드)/실서버
    auth.ts                 login/register (auth-service)
    family.ts               getRoster/addAthlete/멤버/초대 (athlete·family-service)
    intake.ts               extractFromPhoto/Email (ingestion·extraction, mock 샘플)
  data/seed.ts              시드 포트폴리오(자립 렌더용)
  lib/
    time, level, standards, portfolio, ageGroup, ageAnalysis  순수 로직(+테스트)
    match.ts                결과지 추출 → 등록 아이만 매칭 (P6, +테스트)
  components/               Portfolio, LevelRing, BadgeShelf, BestTimesBoard,
                            ProgressionChart, AgeGroupAnalysis, RaceTimeline,
                            FamilyPanel, ReviewRace  (+테스트)
  screens/                  AuthScreen, IntakeScreen, FamilyScreen, SettingsScreen (+테스트)
  styles.css                전체 스타일(앱셸·인증·결과지입력·포트폴리오)
```

## 포트폴리오 설계 (경쟁 벤치마킹 + 차별화)
- **벤치마킹:** 종목별 최고기록 보드, 기준 대비 등급 컬러(히트맵), 향상%, 진척 그래프.
- **차별화:** 레벨 링/뱃지/스트릭(게임화), 가족 리더보드,
  **나이 그룹별 기록 수준 + 향상 속도**(대회는 나이대로 나뉘는데 그 수준이 종단으로
  안 남는 문제를 보완 — 그룹별 최고기록·등급 보존 + 월 향상% 분석).
- 순수 집계는 `lib/`에 분리해 테스트로 고정. 차트는 외부 라이브러리 없이 SVG(번들 경량).

## ★ 결과지 입력 (가장 중요) — 나이대별 쉬운 입력
- **사진**(`IntakeScreen` photo): 마스터즈·커뮤니티 대회 결과지 사진 → `extractFromPhoto` →
  `matchExtractedToAthletes`로 **등록된 아이만** 골라 ReviewRace로 검증 → 확정.
- **이메일**(email): 공식 이메일 본문 + 첨부 → `extractFromEmail` → 동일 매칭/검증.
- 매칭은 형제가 성을 공유하므로 **풀네임 조합/이름(given)** 기준(`lib/match.ts`).
  등록 외 선수는 별도 표시 + **저장 안 함**(P6 프라이버시).
- 각 매칭 기록에 **추정 나이대** 칩 표시(결과지 표기 우선, 없으면 생년월일로 계산).

## ★ 핵심 화면 — 추출 결과 확인·수정 (설계 P2)

`extraction-service`가 OCR/LLM으로 뽑은 `ExtractedRace`를 부모가 검증·수정하는 화면.

- 0.01초 차이가 의미 있고 `1↔7, 0↔8, 콜론↔점` 오인이 치명적 → **사람 검증 필수**(P2).
- 각 race의 종목/거리/코스/기록/등수를 편집 가능한 입력으로 렌더.
- 기록(time)은 `formatMsToTime`로 표시, 편집 시 `parseTimeToMs`로 다시 ms 변환.
- **신뢰도 강조 규칙(P2):** `fieldConfidence[field] < 0.8`인 필드는
  `low-confidence` 클래스(붉은/주황 테두리)와 ⚠ 마커를 표시한다.
  임계값은 `LOW_CONFIDENCE_THRESHOLD` 상수.
- 부모가 수정 후 **확정(Confirm)** → 상위에서 `/api/extraction/confirm`으로 전송.

## 타입/유틸 미러링 원칙

프론트엔드는 독립 빌드되므로 `libs/contracts`를 import하지 않고 **최소 재선언/복사**한다:

- `src/lib/time.ts` = `libs/contracts/src/time.ts` 복사본 (주석에 명시).
- `ExtractedRace` 등 도메인 타입은 `ReviewRace.tsx`에 로컬 재선언.
- **계약이 바뀌면 이 파일들을 수동 동기화**해야 한다.

## 테스트

```
npm test         # vitest run (단위)
npm run typecheck
```

- `time.test.ts`: 파싱/포맷/라운드트립.
- `ReviewRace.test.tsx`: 저신뢰 필드 강조(클래스/⚠), time 편집 시 onChange, Confirm 시 onConfirm.

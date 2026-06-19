# frontend — SwimVault 웹/PWA (React + Vite + TS)

> 이 파일은 frontend 서비스만의 컨텍스트 요약이다(설계 R2). AI 수정 시 이 디렉터리만 읽으면 된다.

## 책임

부모·수영 학생용 클라이언트. 두 축:
1. **포트폴리오(핵심)** — 선수가 평생 쌓는 기록부를 한 화면에. 경쟁 앱(Swimmetry) 벤치마킹 +
   레벨/뱃지/스트릭(게임화)·한·미 통합 타임라인·가족 리더보드로 차별화.
2. **기록 추가** — 결과지 업로드 → ★ 추출 결과 검증·수정(Review & Confirm, 설계 P2).

서비스 직접 호출 없이 `api-gateway`(REST)만 통한다. API 계약은 `docs/03-api-contracts.md`.
데이터는 `src/api/client.ts`만 의존 — 기본은 시드(mock), `VITE_USE_MOCK=false`면 실서버 조립.

## 스택

- React 18 + Vite + TypeScript (모바일 PWA 지향)
- 테스트: Vitest + @testing-library/react (jsdom)
- 독립 패키지로 빌드된다 → 공유 타입/유틸은 `@swimvault/contracts`를 **로컬 미러링**한다.

## 구조

```
src/
  main.tsx                  앱 엔트리
  App.tsx                   탭 셸: 포트폴리오 / 기록 추가
  types.ts                  도메인 타입 (contracts 미러)
  api/
    client.ts               getPortfolio() — mock(시드)/실서버 전환, x-request-id 부여
  data/seed.ts              한·미 양국 시드 포트폴리오(자립 렌더용)
  lib/
    time.ts                 parseTimeToMs / formatMsToTime (contracts 미러)
    level.ts                레벨 곡선 (contracts gamification 미러) + 테스트
    standards.ts            기준 대비 등급(B~AAAA) 계산 + 테스트
    portfolio.ts            베스트타임/향상%/진척/나이 집계 + 테스트
    ageGroup.ts             나이 그룹(10&U~19+) 계산 + 테스트
    ageAnalysis.ts          나이 그룹별 기록·향상 속도(월%) 분석 + 테스트
  components/
    Portfolio.tsx           ★ 포트폴리오 화면(조합)
    LevelRing.tsx           스킬 레벨 SVG 링(게임화 차별)
    BadgeShelf.tsx          획득 뱃지
    BestTimesBoard.tsx      종목별 최고기록 + 등급 히트맵 + 향상%
    ProgressionChart.tsx    선택 종목 진척 SVG 그래프(무외부의존)
    AgeGroupAnalysis.tsx    나이 그룹별 기록 수준 + 향상 속도(차별)
    RaceTimeline.tsx        한·미 통합 타임라인(국기)
    FamilyPanel.tsx         가족 리더보드
    ReviewRace.tsx          ★ 추출 결과 확인·수정 화면(P2)
    *.test.tsx              컴포넌트 테스트
  setupTests.ts             jest-dom 매처
  styles.css                포트폴리오 + .low-confidence 강조 스타일
```

## 포트폴리오 설계 (경쟁 벤치마킹 + 차별화)
- **벤치마킹:** 종목별 최고기록 보드, 기준 대비 등급 컬러(히트맵), 향상%, 진척 그래프.
- **차별화:** 레벨 링/뱃지/스트릭(게임화), 한·미 통합 타임라인, 가족 리더보드,
  **나이 그룹별 기록 수준 + 향상 속도**(대회는 나이대로 나뉘는데 그 수준이 종단으로
  안 남는 문제를 보완 — 그룹별 최고기록·등급 보존 + 월 향상% 분석).
- 순수 집계는 `lib/`에 분리해 테스트로 고정. 차트는 외부 라이브러리 없이 SVG(번들 경량).

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

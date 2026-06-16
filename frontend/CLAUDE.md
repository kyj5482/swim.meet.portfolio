# frontend — SwimVault 웹/PWA (React + Vite + TS)

> 이 파일은 frontend 서비스만의 컨텍스트 요약이다(설계 R2). AI 수정 시 이 디렉터리만 읽으면 된다.

## 책임

부모용 클라이언트. 핵심 UX 흐름: **업로드 → (추출 결과) 검증·수정 → 기록부**.

- 결과지(사진/PDF/결과파일) 업로드 화면
- ★ 추출 결과 확인·수정(Review & Confirm) 화면 — 가장 중요
- 확정된 기록부·진척 뷰 (이후 단계)

서비스 직접 호출 없이 `api-gateway`(REST)만 통한다. API 계약은 `docs/03-api-contracts.md`.

## 스택

- React 18 + Vite + TypeScript (모바일 PWA 지향)
- 테스트: Vitest + @testing-library/react (jsdom)
- 독립 패키지로 빌드된다 → 공유 타입/유틸은 `@swimvault/contracts`를 **로컬 미러링**한다.

## 구조

```
src/
  main.tsx                  앱 엔트리
  App.tsx                   데모 셸 (Review 화면 마운트)
  lib/
    time.ts                 parseTimeToMs / formatMsToTime (contracts 미러)
    time.test.ts            시간 유틸 단위 테스트
  components/
    ReviewRace.tsx          ★ 추출 결과 확인·수정 화면
    ReviewRace.test.tsx     렌더/강조/onChange/onConfirm 테스트
  setupTests.ts             jest-dom 매처
  styles.css                .low-confidence 강조 스타일 포함
```

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

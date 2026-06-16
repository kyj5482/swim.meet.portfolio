# 테스트 전략 (Test Strategy)

## 1. 피라미드
```
        ▲  E2E (1개): 업로드→추출(mock)→검증→기록부 (Playwright, M1+)
       ███ 통합: 서비스 경계 — gateway↔service, 계약 스키마 검증
      █████ 단위(최다): 순수 로직 — 시간 파싱/PB/향상%/검증규칙/기준매칭
```

## 2. 무엇을 반드시 테스트하는가 (위험 기반)
| 우선 | 대상 | 위치 | 이유 |
|------|------|------|------|
| ★★★ | 시간 파싱/포맷 (`1:02.34`↔`62340ms`) | `libs/contracts/time` | 0.01초가 의미(P2). 라운딩·콜론·60초 경계 |
| ★★★ | 추출값 검증 규칙 (`1↔7,0↔8`, 스플릿 합=총기록) | extraction-service | OCR 오인 = 치명적(P2) |
| ★★★ | PB 판정 (코스/종목/거리별 최저 timeMs) | records-service | 잘못된 PB = 신뢰 붕괴 |
| ★★ | 향상% 계산 (이전 PB 대비) | analytics-service | 핵심 가치(P5) |
| ★★ | 기준 매칭 (성별·나이그룹·종목) | standards-service | 나이 경계 버그 흔함 |
| ★ | 인증/소유권 (parent만 자기 아이) | auth/athlete | 프라이버시(P6) |

## 3. 도구
| 영역 | 러너 | 명령 |
|------|------|------|
| Node 서비스 | Jest + ts-jest | `npm test` |
| 추출(Python) | Pytest | `pytest` |
| 프론트 | Vitest + Testing Library | `npm test` |
| 계약 | JSON Schema 검증 | 각 서비스 통합 테스트에 포함 |

## 4. 커버리지 목표 (M0 골격)
- 순수 로직(time, PB, 향상%, 검증규칙): **목표 90%+**, 골격에 대표 테스트 포함.
- 라우팅/IO: 통합 테스트 스텁 + 해피패스 1개.

## 5. CI (제안)
서비스별 병렬 잡: `lint` → `typecheck` → `test`. 변경된 서비스만 실행(path filter)하여 토큰·시간 절약(R1과 동일 철학).

## 6. 골격에 포함된 실제 테스트
- `libs/contracts` — `time.test.ts` (파싱/포맷/경계)
- `records-service` — `pb.test.ts` (PB 판정)
- `analytics-service` — `improvement.test.ts` (향상%)
- `extraction-service` — `test_validation.py` (검증 규칙, 스플릿 합)
- `standards-service` — `match.test.ts` (나이그룹 매칭)

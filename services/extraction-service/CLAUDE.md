# extraction-service (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
업로드된 결과지(사진/PDF/결과파일)에서 **한 아이의 경주 결과**를 추출하고, **필드별 신뢰도**를 붙여 반환한다.
이 시스템에서 **유일하게 LLM/비전 모델(Anthropic Claude)을 호출하는 서비스** (R5).

## 스택
Python + FastAPI + Pydantic v2 + anthropic. 테스트는 pytest + httpx(TestClient).

## 구조
| 파일 | 역할 |
|------|------|
| `app/validation.py` | **순수 검증 로직** (품질의 핵심, 테스트 집중) |
| `app/extractor.py` | 추출 오케스트레이션 (Claude 비전 호출 / 오프라인 MOCK) |
| `app/models.py` | Pydantic 모델 (`libs/contracts`의 ExtractedRace 미러) |
| `app/main.py` | `/api/extraction` 엔드포인트 (얇게) |

## 규칙
- 시간은 항상 `timeMs`(밀리초 정수). (docs/04 시간 규칙)
- 도메인 형태는 `libs/contracts/src/domain.ts`의 ExtractedRace를 미러한다. (R3)
- **AI 호출은 이 서비스에서만** (R5). 다른 서비스는 LLM을 호출하지 않는다.
- `ANTHROPIC_API_KEY`가 없으면 결정적 MOCK을 반환한다(오프라인/테스트 안전).

## P2 — 필수 검증 UX
- `field_confidence`(필드별 0..1)와 `needs_review(race)`가 **부모 검증 화면을 구동**한다.
- 0.01초가 중요하다. 1↔7, 0↔8, 콜론↔점 OCR 오류는 치명적이므로 낮은 신뢰도 필드는 프론트에서 강조하고 사람이 확정한다.
- `needs_review`는 (저신뢰 필드 ∨ 스플릿 합 불일치 ∨ OCR 의심) 중 하나라도 참이면 True.

## P3 — 3계층 신뢰
`sourceType`: `photo`(최저) < `pdf` < `result_file`(최고). 신뢰 계층 신호로 사용.

## 테스트
`.venv/bin/pytest -q`
- `tests/test_validation.py`: 스플릿 합(정확/허용오차/초과), 저신뢰 플래그, OCR 의심, needs_review 경계.
- `tests/test_api.py`: `/health`, `/extract`(>=1 race + confidence), `/confirm`.

## API
`docs/03-api-contracts.md`의 extraction 섹션 참조.
| 메서드 | 경로 | 본문 → 응답 |
|--------|------|-------------|
| POST | `/api/extraction/extract` | `{jobId, sourceType, fileRef}` → `{races, confidence}` |
| POST | `/api/extraction/confirm` | `{jobId, races}` → `{status:"confirmed"}` (TODO: records로 전달) |
| GET | `/health` | `{status:"ok"}` |

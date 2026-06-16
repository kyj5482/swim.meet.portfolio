# ingestion-service (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
업로드 수신 → **ExtractionJob 생성**(status='uploaded'). 파일 종류 판정 + 기본 신뢰도 부여.

## 스택
Node + TypeScript + Express + Zod. 테스트는 Jest(ESM).

## 구조
| 파일 | 역할 |
|------|------|
| `src/sourceType.ts` | **detectSourceType 순수 로직 + 기본 신뢰도**(테스트 핵심) |
| `src/service.ts` | 업로드 → 잡 생성 오케스트레이션 |
| `src/repository.ts` | 잡 스토리지(인메모리 기본) |
| `src/routes.ts` | `/api/uploads` 엔드포인트 (얇게) |
| `src/index.ts` | Express 부트스트랩, `GET /health` |

## 규칙
- 확장자 매핑: `.hy3/.cl2/.sd3`→result_file, `.pdf`→pdf, `.jpg/.jpeg/.png/.heic`→photo, 그 외 예외.
- 신뢰 계층(P3): source_type별 기본 신뢰도는 `@swimvault/contracts`의 `DEFAULT_CONFIDENCE`.
- **프라이버시(P6): 잡은 athleteId(→소유 부모)로 귀속**. 소유권은 게이트웨이 JWT로 검증(M1).
- 골격은 멀티파트 대신 JSON `{athleteId, filename}` 수신. 실제 파일 업로드는 M1.
- 도메인 타입은 `@swimvault/contracts`에서만 가져온다. (R3)

## 테스트
`npm test` — `sourceType.test.ts`가 확장자 카테고리별 판정·미지원 예외·기본 신뢰도 보호.

## API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/uploads` | `{athleteId, filename}` → ExtractionJob(uploaded) |
| GET | `/api/uploads/jobs/:id` | 잡 단건 조회 |

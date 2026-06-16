# SwimVault 🏊

> **"큰 앱들이 볼 수 없는 우리 아이의, 모든 기록이 모이는 단 하나의 장소."**

어느 대회·어느 리그·어느 나라든 결과지를 한 장 찍으면 → 우리 아이 기록만 추출 →
평생 기록부 + 진척·스플릿 분석. 여름 리그·YMCA·고교·동네 클럽·해외(한국) 대회 등
USA Swimming 중앙 기록에 없는 **방치된 세그먼트**를 위한 기록 통합 서비스.

📄 **설계서부터 읽으세요 → [`docs/01-design-document.md`](docs/01-design-document.md)**

## 문서
| 문서 | 내용 |
|------|------|
| [01 설계서](docs/01-design-document.md) | 배경·차별점·제품 원칙·범위·로드맵 |
| [02 아키텍처](docs/02-architecture.md) | 디렉터리·통신·토큰 절약 규칙 |
| [03 API 계약](docs/03-api-contracts.md) | 서비스별 엔드포인트 |
| [04 데이터 모델](docs/04-data-model.md) | 엔티티·시간 규칙 |
| [05 테스트 전략](docs/05-test-strategy.md) | 위험 기반 테스트 |

## 마이크로서비스 구성
| 서비스 | 스택 | 책임 |
|--------|------|------|
| `services/api-gateway` | Node/TS | 라우팅·인증검증 |
| `services/auth-service` | Node/TS | 부모 계정·JWT |
| `services/athlete-service` | Node/TS | 아이 프로필 |
| `services/ingestion-service` | Node/TS | 업로드·추출 잡 |
| `services/extraction-service` | Python/FastAPI | **비전+LLM 추출 (유일한 AI 호출)** |
| `services/records-service` | Node/TS | 기록·스플릿·PB |
| `services/standards-service` | Node/TS | USAS/커스텀 기준 |
| `services/analytics-service` | Node/TS | 진척·향상%·스플릿 |
| `frontend` | React+Vite+TS | 업로드·검증 UX·기록부 |
| `libs/contracts` | TS | 서비스 간 공유 타입·시간 유틸 |

## 바이브 코딩을 위한 설계 (토큰 절약)
서비스 경계를 잘게 나누어 **AI로 한 서비스를 수정할 때 그 디렉터리만 읽으면 되도록** 했습니다.
각 서비스에 `CLAUDE.md`가 있어 컨텍스트가 완결되고, **런타임 LLM 호출은 `extraction-service` 한 곳에만** 격리됩니다.

## 빠른 시작
```bash
# 1) 공유 계약 빌드
cd libs/contracts && npm install && npm run build && cd ../..

# 2) 개별 서비스 (예: records-service)
cd services/records-service && npm install && npm test

# 3) 추출 서비스 (Python)
cd services/extraction-service && pip install -e . && pytest

# 4) 전체 로컬 기동
docker compose up --build
```

## 상태
**M0** — 설계서 + 마이크로서비스 골격(스캐폴딩) + 공유 계약 + 위험 기반 대표 테스트.
다음(M1): 추출 서비스 Claude vision 실연동 + 검증 화면 완성.

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
| [06 경쟁 분석](docs/06-competitive-analysis.md) | 시장·차별화·수익 모델 |
| [07 게임화](docs/07-gamification.md) | 레벨·XP·스트릭·뱃지 |
| [08 가족 모델](docs/08-family-model.md) | 보호자·학생 멤버십 |
| [09 에이전트/워크플로](docs/09-agents-and-workflow.md) | 에이전트 팀·dev/live·실행·로그·iOS |

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
| `services/gamification-service` | Node/TS | **레벨·XP·스트릭·뱃지·가족 리더보드 (리텐션)** |
| `services/family-service` | Node/TS | **가족 단위 관리(보호자·학생 멤버십)** |
| `frontend` | React+Vite+TS | 업로드·검증 UX·기록부 |
| `libs/contracts` | TS | 서비스 간 공유 타입·시간 유틸 |

## 바이브 코딩을 위한 설계 (토큰 절약)
서비스 경계를 잘게 나누어 **AI로 한 서비스를 수정할 때 그 디렉터리만 읽으면 되도록** 했습니다.
각 서비스에 `CLAUDE.md`가 있어 컨텍스트가 완결되고, **런타임 LLM 호출은 `extraction-service` 한 곳에만** 격리됩니다.

## 빠른 시작

### 1커맨드 실행 (dev / live)
```bash
scripts/run.sh dev        # config/dev.env 로드 → 전 서비스+프론트 기동, 로그는 logs/
scripts/stop.sh           # 전체 중지
scripts/test-all.sh       # 프론트→API→백엔드 일괄 테스트 (logs/test-all.log)
```
추적: 게이트웨이 `x-request-id` 접근 로그가 시작점 → `grep <reqId> logs/*.log` (자세히는 `logs/README.md`).

### 개별/도커
```bash
cd libs/contracts && npm install && npm run build && cd ../..   # 공유 계약 빌드(먼저)
cd services/gamification-service && npm install && npm test     # 개별 서비스
cd services/extraction-service && pip install -e . && pytest    # 추출(Python)
docker compose up --build                                       # 전체 컨테이너 기동
```

## 상태
**M1 (진행)** — M0 골격 위에:
- **gamification-service**(레벨·XP·스트릭·뱃지·가족 리더보드) + **family-service**(보호자/학생 멤버십) 신규.
- dev/live config, 1커맨드 실행 셸, 게이트웨이 요청 추적 로그.
- 에이전트 팀(`.claude/agents/`: app-planner·frontend-dev·backend-dev·operator) + 경쟁/게임화/가족/워크플로 문서.

다음: 프론트 게임화·가족 화면, records→gamification 자동 이벤트, 추출 Claude vision 실연동, Capacitor iOS 패키징.

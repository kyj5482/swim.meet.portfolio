# 에이전트 팀 & 개발/운영 워크플로 (Agents & Workflow)

이 문서는 "여러 에이전트가 토론·검증하며 사용자 관점으로 하나씩 진행"하기 위한 규칙과,
개발/운영(dev·live config, 1커맨드 실행, 로그 추적, 새 Feature 추가, iOS 출시)을 명세한다.

## 1. 에이전트 팀 (`.claude/agents/`)

| 에이전트 | 역할 | 산출물 |
|----------|------|--------|
| **app-planner** | 시장/경쟁, 요구·수용 기준, 우선순위, 수익·게임화 | 스토리·수용 기준·테스트 시나리오·검증 |
| **frontend-dev** | React/PWA + iOS(Capacitor) UI | 화면·컴포넌트·Vitest |
| **backend-dev** | Node/TS·Python 마이크로서비스 Feature | 서비스·엔드포인트·Jest/Pytest |
| **operator** | config·실행·로그·CI·배포·iOS 출시 | 스크립트·워크플로·체크리스트 |

**협업 루프 (한 Feature):**
```
planner: 요구+수용기준+테스트 시나리오 정의
  → backend-dev: 계약+서비스 구현, 단위테스트+curl 검증
  → frontend-dev: 화면 구현, 계약 일치 확인, 컴포넌트 테스트
  → operator: run/test-all/CI/compose/config 동기화, 로그 확인
  → planner: 사용자 관점 수용 검증 → 합격이면 다음 Feature
```
각 단계는 **테스트 케이스와 데이터로** 통과를 증명한 뒤 다음으로 넘어간다(프론트→API→백엔드).

## 2. 바이브 코딩 규칙 (토큰 절약 — R1~R5)
- **R1** 한 서비스 = 한 책임.  **R2** 각 서비스 `CLAUDE.md`로 맥락 완결.
- **R3** 서비스 간 결합은 `libs/contracts`로만.  **R4** 파일 작고 단일 목적(<150 LOC).
- **R5** LLM 호출은 `extraction-service`에만.

## 3. 새 Feature(서비스) 추가 절차 — backend-dev/operator 공용 체크리스트
1. `libs/contracts`에 필요한 타입/순수 함수 추가 → `npm run build`.
2. `services/<new>/` 스캐폴드: `package.json`(기존 서비스 복사), `tsconfig.json`·`jest.config.cjs`(records-service에서 복사).
   - contracts의 **런타임 값**을 import하면 jest 설정 transform에 `isolatedModules: true` 추가.
3. `src/`: 순수 도메인 로직(테스트 동반) → `service.ts` → `repository.ts`(인메모리) → `routes.ts`(얇게, Zod) → `index.ts`(포트).
4. `CLAUDE.md` 작성(R2).
5. **5곳 동기화**: `api-gateway/src/proxy.ts`(라우트) + 그 테스트, `docker-compose.yml`(서비스+게이트웨이 env+depends_on), `config/dev.env`·`config/live.env`(포트+URL), `scripts/run.sh`(start_node), `scripts/test-all.sh`(루프), `.github/workflows`(CI 매트릭스).
6. `npm test`+`npm run build`, 그리고 기동 후 `curl`로 핵심 흐름 1개 확인.

## 4. 환경 config (dev / live)
- `config/dev.env` — 로컬(localhost 포트, mock 추출 허용).
- `config/live.env` — 운영 템플릿. **비밀값 커밋 금지**, 시크릿 매니저/CI 변수로 주입.
- 두 파일 모두 포트·서비스 URL·`VITE_API_BASE`를 정의 → 프론트/게이트웨이/서비스가 같은 출처를 본다.

## 5. 1커맨드 실행 & 로그 추적
```bash
scripts/run.sh dev            # 전 서비스 + 프론트 기동 (logs/<svc>.log)
scripts/run.sh live --no-frontend
scripts/stop.sh               # 전체 중지
scripts/test-all.sh           # 프론트→API→백엔드 일괄 테스트 (logs/test-all.log)
```
- 모든 출력은 `logs/`로 수집. **게이트웨이 `x-request-id` 접근 로그가 추적 시작점**.
  하나의 흐름은 `grep <reqId> logs/*.log`로 추적. 상세: `logs/README.md`.

## 6. iOS 출시 준비 체크리스트 (operator 관리, 로드맵)
- [ ] 프론트엔드 PWA 완성(오프라인·설치 가능) → **Capacitor**로 iOS 래핑.
- [ ] App Store Connect 앱 등록, 번들 ID, 서명/프로비저닝.
- [ ] 개인정보 보호 라벨(P6): 수집 항목 최소·미성년자 정책·"다른 아이 검색 불가" 명시.
- [ ] 스크린샷/프리뷰(게임화·한미 통합 강조), 키워드(롱테일).
- [ ] 결제(StoreKit) — Family Plus 구독.
- [ ] TestFlight 베타(한인 커뮤니티) → 심사 제출.

## 7. 현재 상태 (M1 진행)
- 신규: `gamification-service`(레벨·XP·스트릭·뱃지·가족 리더보드), `family-service`(보호자/학생 멤버십).
- 운영: dev/live config, run/stop/test-all, 게이트웨이 추적 로그.
- 다음: 프론트 게임화/가족 화면, records→gamification 자동 이벤트, extraction Claude vision 실연동, Capacitor iOS.

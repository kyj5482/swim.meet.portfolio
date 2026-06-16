# 아키텍처 노트 (Architecture)

## 디렉터리 구조
```
swim.meet.portfolio/
├── docs/                      설계 문서
├── libs/contracts/            서비스 간 공유 타입 + 시간 유틸 (단일 진실 공급원)
├── services/
│   ├── api-gateway/           Node/TS — 진입점, 라우팅, 인증 검증
│   ├── auth-service/          Node/TS — 부모 계정, JWT
│   ├── athlete-service/       Node/TS — 아이 프로필
│   ├── ingestion-service/     Node/TS — 업로드, 추출 잡 생성
│   ├── extraction-service/    Python/FastAPI — 비전+LLM 추출 (★유일한 AI 호출 지점)
│   ├── records-service/       Node/TS — 기록·스플릿·PB
│   ├── standards-service/     Node/TS — USAS/커스텀 기준
│   └── analytics-service/     Node/TS — 진척·향상%·스플릿 분석
├── frontend/                  React + Vite + TS
└── docker-compose.yml         로컬 1커맨드 기동
```

## 바이브 코딩 토큰 절약 규칙 (재확인)
- **R1** 한 서비스 = 한 책임. 디렉터리 하나로 맥락 완결.
- **R2** 각 서비스 루트에 `CLAUDE.md` — 그 서비스만의 컨텍스트 요약.
- **R3** 서비스 간 결합은 `libs/contracts`로만.
- **R4** 파일은 작고 단일 목적 (평균 < 150 LOC).
- **R5** LLM 호출은 extraction-service에만 격리.

## Node 서비스 공통 골격
```
service/
├── CLAUDE.md          이 서비스의 컨텍스트 (AI용)
├── package.json
├── tsconfig.json
├── jest.config.cjs
└── src/
    ├── index.ts       Express 부트스트랩
    ├── routes.ts      엔드포인트 (얇게)
    ├── service.ts     도메인 로직 (테스트 대상)
    ├── repository.ts  스토리지 추상화 (인메모리 기본)
    └── *.test.ts      단위 테스트
```

## 통신
- 외부 → `api-gateway`(REST). 내부 → 서비스 간 REST(골격) / 이후 메시지 큐(extraction.requested 이벤트)로 진화.
- 추출은 비동기: ingestion이 잡 생성 → extraction 처리 → 프론트가 `needs_review`에서 검증.

## 보안/프라이버시 (P6)
- 모든 athlete/records 접근은 토큰의 parentId 소유권 검증.
- 다른 아이로 검색 가능한 인덱스는 만들지 않음.
- 원본 결과지 파일은 비공개 버킷, 서명 URL로만 접근.

## 환경 변수 (공통)
| 변수 | 용도 |
|------|------|
| `PORT` | 서비스 포트 |
| `JWT_SECRET` | 토큰 서명(auth/gateway 공유) |
| `ANTHROPIC_API_KEY` | **extraction-service만** |
| `*_SERVICE_URL` | 서비스 디스커버리(골격: env) |

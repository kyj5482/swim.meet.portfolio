# auth-service (CLAUDE 컨텍스트)

> 이 파일만 읽으면 이 서비스를 바이브 코딩할 수 있도록 컨텍스트를 완결한다. (설계 R2)

## 책임
부모(Parent) 계정 등록/로그인, 본인 조회. **인증 진입점**.

## 스택
Node + TypeScript + Express + Zod. 테스트는 Jest(ESM).

## 구조
| 파일 | 역할 |
|------|------|
| `src/auth.ts` | **validateEmail / validatePasswordStrength 순수 로직** (테스트 핵심) |
| `src/service.ts` | register/login/me 오케스트레이션 |
| `src/repository.ts` | 부모 계정 스토리지(인메모리 기본) |
| `src/routes.ts` | `/api/auth` 엔드포인트 (얇게) |
| `src/index.ts` | Express 부트스트랩, `GET /health` |

## 규칙
- 비밀번호 최소 8자(골격). 도메인 타입은 `@swimvault/contracts`에서만. (R3)
- **골격 토큰 = parentId** (스텁). 실제 비밀번호 해싱·JWT 서명/검증은 M1.
- 부모 계정은 자녀(Athlete) 소유권의 루트 — 프라이버시(P6)의 기반.

## 테스트
`npm test` — `auth.test.ts`가 이메일 유효/무효·비밀번호 길이 경계(7/8) 보호.

## API
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 부모 등록 → `{parent, token}` |
| POST | `/api/auth/login` | 로그인 → `{parent, token}` |
| GET | `/api/auth/me` | Bearer(=parentId)로 본인 조회 |

# API 계약 (API Contracts)

> 모든 외부 요청은 `api-gateway`(기본 :8080)를 통과한다. 서비스 직접 호출은 내부망 전용.
> 타입 정의: `libs/contracts`.

## 인증 (auth-service, /api/auth)
| 메서드 | 경로 | 본문 | 응답 |
|--------|------|------|------|
| POST | `/register` | `{email, password, displayName}` | `{token, parent}` |
| POST | `/login` | `{email, password}` | `{token, parent}` |
| GET | `/me` | (Bearer) | `{parent}` |

## 선수 (athlete-service, /api/athletes)
| 메서드 | 경로 | 비고 |
|--------|------|------|
| POST | `/` | 아이 등록 (parentId = 토큰 주체) |
| GET | `/` | 내 아이 목록 |
| GET | `/:id` | 단건 (소유 검증) |
| PATCH | `/:id` | 수정 |

## 업로드 (ingestion-service, /api/uploads)
| 메서드 | 경로 | 비고 |
|--------|------|------|
| POST | `/` | multipart: `file`, `athleteId` → ExtractionJob 생성, `sourceType` 자동판별 |
| GET | `/jobs/:id` | 잡 상태 폴링 |

## 추출 (extraction-service, /api/extraction) — Python/FastAPI
| 메서드 | 경로 | 본문 | 응답 |
|--------|------|------|------|
| POST | `/extract` | `{jobId, sourceType, fileRef}` | `{races: ExtractedRace[], confidence}` |
| POST | `/confirm` | `{jobId, races}` (부모 검증·수정본) | `{status: "confirmed"}` → records로 전달 |

**ExtractedRace (검증 전):**
```jsonc
{
  "stroke": "FR", "distance": 50, "course": "SCY",
  "timeMs": 28910, "place": 3,
  "splits": [{ "segmentMeters": 50, "cumulativeMs": 28910, "intervalMs": 28910 }],
  "fieldConfidence": { "timeMs": 0.72, "place": 0.95 }  // P2: 낮은 값은 프론트에서 강조
}
```

## 기록 (records-service, /api/records)
| 메서드 | 경로 | 비고 |
|--------|------|------|
| POST | `/` | 확정 기록 적재 (PB 판정 수행) |
| GET | `/athletes/:id` | 기록부(필터: stroke, distance, course) |
| GET | `/athletes/:id/pb` | 종목별 PB |

## 기준 (standards-service, /api/standards)
| 메서드 | 경로 | 비고 |
|--------|------|------|
| GET | `/match` | query: gender, age, stroke, distance, course → 해당 기준들 |
| POST | `/custom` | 리그 커스텀 기준 등록 |

## 분석 (analytics-service, /api/analytics)
| 메서드 | 경로 | 비고 |
|--------|------|------|
| GET | `/athletes/:id/progress` | 종목별 시계열(향상%) |
| GET | `/athletes/:id/splits/:raceId` | 스플릿 분석(전·후반, 페이스) |

## 공통 규약
- 인증: `Authorization: Bearer <jwt>`.
- 에러: `{ error: { code, message } }`, HTTP 상태코드 일치.
- 검증: 모든 입력은 Zod(Node)/Pydantic(Py)로 런타임 검증 → 계약 위반 시 422.

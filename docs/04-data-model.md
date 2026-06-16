# 데이터 모델 (Data Model)

> 단일 진실 공급원은 `libs/contracts/src/*.ts`. 본 문서는 사람이 읽는 요약.

## ER 개요

```
Parent 1──N Athlete 1──N RaceResult N──1 Meet
                            │
                            └──1──N Split
Standard (독립; 성별·나이·종목·거리·코스로 매칭)
ExtractionJob (Athlete·업로드 파일 추적)
```

## 엔티티

### Parent (auth-service)
| 필드 | 타입 | 비고 |
|------|------|------|
| id | UUID | PK |
| email | string | unique |
| passwordHash | string | argon2/bcrypt |
| displayName | string | |
| createdAt | ISO datetime | |

### Athlete (athlete-service)
| 필드 | 타입 | 비고 |
|------|------|------|
| id | UUID | PK |
| parentId | UUID | FK → Parent (P6: 소유자) |
| firstName / lastName | string | |
| birthDate | date | 나이 그룹 계산용 |
| gender | `M` \| `F` \| `X` | 기준 매칭용 |
| clubs | string[] | 소속(한·미 다중 가능) |
| countryCodes | string[] | 예: `["US","KR"]` (통합 훅) |

### Meet (records-service)
| 필드 | 타입 | 비고 |
|------|------|------|
| id | UUID | PK |
| name | string | 대회명 |
| date | date | |
| league | string | summer/YMCA/club/highschool/USAS/KSA 등 |
| country | string | ISO-3166 alpha-2 |
| course | `SCY` \| `SCM` \| `LCM` | 코스 길이 |

### RaceResult (records-service)
| 필드 | 타입 | 비고 |
|------|------|------|
| id | UUID | PK |
| athleteId | UUID | FK |
| meetId | UUID | FK |
| stroke | `FR`\|`BK`\|`BR`\|`FL`\|`IM` | |
| distance | number | meters/yards |
| course | `SCY`\|`SCM`\|`LCM` | |
| timeMs | number | **시간은 항상 밀리초 정수로 저장**(정밀도/비교) |
| place | number? | 등수 |
| isPB | boolean | 적재 시 records-service가 판정 |
| sourceJobId | UUID? | 추출 출처 추적 |
| confidence | number | 0..1 (검증 후 1.0) |

### Split (records-service)
| 필드 | 타입 | 비고 |
|------|------|------|
| id | UUID | PK |
| raceResultId | UUID | FK |
| segmentMeters | number | 예: 50 |
| cumulativeMs | number | 누적 |
| intervalMs | number | 구간 |

### Standard (standards-service)
| 필드 | 타입 | 비고 |
|------|------|------|
| id | UUID | PK |
| system | `USAS` \| `CUSTOM` | |
| leagueId | string? | CUSTOM일 때 |
| label | string | 예: `AAA`, `A`, `Sectionals` |
| gender / ageMin / ageMax / stroke / distance / course | | 매칭 키 |
| timeMs | number | 기준 시간 |

### ExtractionJob (ingestion + extraction)
| 필드 | 타입 | 비고 |
|------|------|------|
| id | UUID | PK |
| athleteId | UUID | |
| sourceType | `photo`\|`pdf`\|`result_file` | 신뢰 계층(P3) |
| status | `uploaded`\|`extracting`\|`needs_review`\|`confirmed`\|`failed` | |
| fileRef | string | 객체 스토리지 키 |
| extracted | ExtractedRace[] | 추출 결과(검증 전) |

## 시간(time) 규칙
- **저장은 밀리초 정수(`timeMs`)** — 부동소수 비교 오류 방지.
- 표시: `mm:ss.SS` (예: `1:02.34`), 60초 미만은 `ss.SS` (예: `28.91`).
- 파싱/포맷 단일 구현은 `libs/contracts`의 `time.ts` (단위 테스트 대상).

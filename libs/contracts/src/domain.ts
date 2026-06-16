/** 도메인 엔티티 타입 — 서비스 간 단일 진실 공급원. 상세는 docs/04-data-model.md */

export type Stroke = 'FR' | 'BK' | 'BR' | 'FL' | 'IM';
export type Course = 'SCY' | 'SCM' | 'LCM';
export type Gender = 'M' | 'F' | 'X';
export type SourceType = 'photo' | 'pdf' | 'result_file';
export type JobStatus =
  | 'uploaded'
  | 'extracting'
  | 'needs_review'
  | 'confirmed'
  | 'failed';

export interface Parent {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface Athlete {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  birthDate: string; // ISO date
  gender: Gender;
  clubs: string[];
  countryCodes: string[]; // 예: ["US","KR"] — 한·미 통합 훅
}

export interface Meet {
  id: string;
  name: string;
  date: string;
  league: string;
  country: string; // ISO-3166 alpha-2
  course: Course;
}

export interface Split {
  id: string;
  raceResultId: string;
  segmentMeters: number;
  cumulativeMs: number;
  intervalMs: number;
}

export interface RaceResult {
  id: string;
  athleteId: string;
  meetId: string;
  stroke: Stroke;
  distance: number;
  course: Course;
  timeMs: number; // 항상 밀리초 정수
  place?: number;
  isPB: boolean;
  sourceJobId?: string;
  confidence: number; // 0..1, 검증 후 1.0
}

export interface Standard {
  id: string;
  system: 'USAS' | 'CUSTOM';
  leagueId?: string;
  label: string; // 예: "AAA", "A", "Sectionals"
  gender: Gender;
  ageMin: number;
  ageMax: number;
  stroke: Stroke;
  distance: number;
  course: Course;
  timeMs: number;
}

/** 추출 결과(부모 검증 전). fieldConfidence가 낮은 필드는 프론트에서 강조. (P2) */
export interface ExtractedRace {
  stroke: Stroke;
  distance: number;
  course: Course;
  timeMs: number;
  place?: number;
  splits: Array<Pick<Split, 'segmentMeters' | 'cumulativeMs' | 'intervalMs'>>;
  fieldConfidence: Record<string, number>;
}

export interface ExtractionJob {
  id: string;
  athleteId: string;
  sourceType: SourceType;
  status: JobStatus;
  fileRef: string;
  extracted: ExtractedRace[];
}

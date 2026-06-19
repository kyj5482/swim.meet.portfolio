/** @swimvault/contracts — 서비스 간 공유 진입점 */
export * from './domain.js';
export * from './time.js';
export * from './gamification.js';
export * from './family.js';

/** 표준 에러 형태 (docs/03-api-contracts.md) */
export interface ApiError {
  error: { code: string; message: string };
}

/** 신뢰 계층(P3) → source_type별 기본 신뢰도 */
export const DEFAULT_CONFIDENCE: Record<string, number> = {
  result_file: 0.97,
  pdf: 0.85,
  photo: 0.6,
};

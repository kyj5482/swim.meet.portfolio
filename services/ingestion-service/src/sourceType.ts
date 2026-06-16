import { DEFAULT_CONFIDENCE, type SourceType } from '@swimvault/contracts';

/**
 * 파일 확장자 → SourceType 판정 (순수 로직, 테스트 핵심).
 * - 결과 파일(.hy3/.cl2/.sd3) → result_file
 * - .pdf → pdf
 * - 이미지(.jpg/.jpeg/.png/.heic) → photo
 * - 그 외 → 예외
 */
const RESULT_FILE_EXTS = new Set(['.hy3', '.cl2', '.sd3']);
const PHOTO_EXTS = new Set(['.jpg', '.jpeg', '.png', '.heic']);

function extOf(filename: string): string {
  const idx = filename.lastIndexOf('.');
  if (idx < 0) return '';
  return filename.slice(idx).toLowerCase();
}

export function detectSourceType(filename: string): SourceType {
  const ext = extOf(filename);
  if (RESULT_FILE_EXTS.has(ext)) return 'result_file';
  if (ext === '.pdf') return 'pdf';
  if (PHOTO_EXTS.has(ext)) return 'photo';
  throw new Error(`unsupported file type: ${filename}`);
}

/** source_type별 기본 신뢰도(P3). contracts의 DEFAULT_CONFIDENCE 사용. */
export function defaultConfidenceFor(sourceType: SourceType): number {
  return DEFAULT_CONFIDENCE[sourceType] ?? 0;
}

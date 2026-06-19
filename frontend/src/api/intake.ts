/**
 * 결과지 입력 클라이언트 — 두 경로:
 *  1) 사진: 마스터즈·커뮤니티 대회 결과지 사진 → 추출(등록된 아이만 매칭은 호출측에서)
 *  2) 이메일: 공식 이메일 본문 + 첨부 파싱 → 추출
 *
 * mock 기본: 결정적 샘플 추출을 반환(등록 아이 + 외부 선수 혼합 → 매칭/프라이버시 시연).
 * 실서버: ingestion-service 업로드 → extraction-service 추출(후속 연동).
 */
import { USE_MOCK, apiFetch } from './config';
import type { ExtractedRow } from '../types';

/** 사진 결과지 샘플(커뮤니티 대회) — 우리 아이 2명 + 외부 선수 2명. */
export const SAMPLE_PHOTO_ROWS: ExtractedRow[] = [
  { swimmerName: 'Kim 지우', ageGroup: '13-14', stroke: 'FR', distance: 50, course: 'SCY', timeMs: 33100, place: 2,
    fieldConfidence: { stroke: 0.98, distance: 0.97, course: 0.95, timeMs: 0.71, place: 0.9 } },
  { swimmerName: '민준 Kim', ageGroup: '10&U', stroke: 'BK', distance: 50, course: 'SCY', timeMs: 48300, place: 5,
    fieldConfidence: { stroke: 0.96, distance: 0.95, course: 0.95, timeMs: 0.88, place: 0.82 } },
  { swimmerName: 'Emily Chen', ageGroup: '13-14', stroke: 'FR', distance: 50, course: 'SCY', timeMs: 31900, place: 1,
    fieldConfidence: { timeMs: 0.9 } },
  { swimmerName: 'Sophia Park', ageGroup: '11-12', stroke: 'BR', distance: 50, course: 'SCY', timeMs: 45200, place: 3,
    fieldConfidence: { timeMs: 0.85 } },
];

/** 공식 이메일 결과 샘플 — 우리 아이 + 외부 선수. */
export const SAMPLE_EMAIL_ROWS: ExtractedRow[] = [
  { swimmerName: '지우', ageGroup: '13-14', stroke: 'FR', distance: 100, course: 'SCY', timeMs: 78500, place: 3,
    fieldConfidence: { stroke: 0.99, distance: 0.99, course: 0.99, timeMs: 0.97, place: 0.95 } },
  { swimmerName: '민준', ageGroup: '10&U', stroke: 'FR', distance: 25, course: 'SCY', timeMs: 19800, place: 2,
    fieldConfidence: { stroke: 0.99, distance: 0.98, course: 0.98, timeMs: 0.96 } },
  { swimmerName: 'Michael Lee', ageGroup: '15-16', stroke: 'FL', distance: 100, course: 'SCY', timeMs: 64200, place: 1,
    fieldConfidence: { timeMs: 0.95 } },
];

export async function extractFromPhoto(_file?: File | null): Promise<ExtractedRow[]> {
  if (USE_MOCK) return structuredClone(SAMPLE_PHOTO_ROWS);
  // 실서버: multipart 업로드 → 잡 폴링 → 추출 결과 (후속 연동). 실패 시 샘플.
  try {
    const res = await apiFetch('/api/uploads', { method: 'POST', body: JSON.stringify({ sourceType: 'photo' }) });
    if (!res.ok) return structuredClone(SAMPLE_PHOTO_ROWS);
    const job = await res.json();
    const ex = await apiFetch(`/api/extraction/${job.id ?? ''}`);
    return ex.ok ? ((await ex.json()).rows ?? []) : structuredClone(SAMPLE_PHOTO_ROWS);
  } catch {
    return structuredClone(SAMPLE_PHOTO_ROWS);
  }
}

export async function extractFromEmail(body: string, _file?: File | null): Promise<ExtractedRow[]> {
  if (USE_MOCK) return structuredClone(SAMPLE_EMAIL_ROWS);
  try {
    const res = await apiFetch('/api/uploads/email', { method: 'POST', body: JSON.stringify({ body }) });
    return res.ok ? ((await res.json()).rows ?? []) : structuredClone(SAMPLE_EMAIL_ROWS);
  } catch {
    return structuredClone(SAMPLE_EMAIL_ROWS);
  }
}

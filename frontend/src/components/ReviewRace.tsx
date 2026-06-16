import { useState } from 'react';
import { formatMsToTime, parseTimeToMs } from '../lib/time';

/**
 * 로컬 도메인 타입. `@swimvault/contracts`의 ExtractedRace를 미러링한다.
 * (프론트엔드 독립 빌드를 위한 최소 재선언 — 계약 변경 시 동기화 필요)
 */
export type Stroke = 'FR' | 'BK' | 'BR' | 'FL' | 'IM';
export type Course = 'SCY' | 'SCM' | 'LCM';

export interface ExtractedRace {
  stroke: Stroke;
  distance: number;
  course: Course;
  timeMs: number;
  place?: number;
  fieldConfidence: Record<string, number>;
}

/** P2: 이 값 미만 신뢰도 필드는 강조 + 경고. 0.01초가 치명적인 도메인. */
export const LOW_CONFIDENCE_THRESHOLD = 0.8;

export interface ReviewRaceProps {
  race: ExtractedRace;
  onChange: (race: ExtractedRace) => void;
  onConfirm: (race: ExtractedRace) => void;
}

const STROKES: Stroke[] = ['FR', 'BK', 'BR', 'FL', 'IM'];
const COURSES: Course[] = ['SCY', 'SCM', 'LCM'];

function isLow(race: ExtractedRace, field: string): boolean {
  const c = race.fieldConfidence[field];
  return typeof c === 'number' && c < LOW_CONFIDENCE_THRESHOLD;
}

function confidencePct(race: ExtractedRace, field: string): string {
  const c = race.fieldConfidence[field];
  return typeof c === 'number' ? `${Math.round(c * 100)}%` : '—';
}

/**
 * 추출 결과 확인·수정 (Review & Confirm) — 설계 P2 핵심 화면.
 * 각 필드는 신뢰도를 표시하고, 낮은 신뢰도(<0.8)는 `low-confidence` 강조 + ⚠ 마커.
 */
export function ReviewRace({ race, onChange, onConfirm }: ReviewRaceProps) {
  // 시간 입력은 표시 문자열로 로컬 관리(편집 중 부분 입력 허용), 유효할 때만 timeMs 반영.
  const [timeText, setTimeText] = useState<string>(formatMsToTime(race.timeMs));

  const fieldClass = (field: string) =>
    isLow(race, field) ? 'field low-confidence' : 'field';

  const warning = (field: string) =>
    isLow(race, field) ? (
      <span className="warning" role="alert" aria-label="low confidence">
        ⚠
      </span>
    ) : null;

  const handleTimeChange = (value: string) => {
    setTimeText(value);
    const ms = parseTimeToMs(value);
    if (ms !== null) onChange({ ...race, timeMs: ms });
  };

  return (
    <section className="review-race" aria-label="extracted race review">
      <div className={fieldClass('stroke')}>
        <label htmlFor="stroke">
          종목 (Stroke) {warning('stroke')}
          <span className="confidence">{confidencePct(race, 'stroke')}</span>
        </label>
        <select
          id="stroke"
          value={race.stroke}
          onChange={(e) => onChange({ ...race, stroke: e.target.value as Stroke })}
        >
          {STROKES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className={fieldClass('distance')}>
        <label htmlFor="distance">
          거리 (Distance) {warning('distance')}
          <span className="confidence">{confidencePct(race, 'distance')}</span>
        </label>
        <input
          id="distance"
          type="number"
          value={race.distance}
          onChange={(e) =>
            onChange({ ...race, distance: Number(e.target.value) })
          }
        />
      </div>

      <div className={fieldClass('course')}>
        <label htmlFor="course">
          코스 (Course) {warning('course')}
          <span className="confidence">{confidencePct(race, 'course')}</span>
        </label>
        <select
          id="course"
          value={race.course}
          onChange={(e) => onChange({ ...race, course: e.target.value as Course })}
        >
          {COURSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className={fieldClass('timeMs')}>
        <label htmlFor="time">
          기록 (Time) {warning('timeMs')}
          <span className="confidence">{confidencePct(race, 'timeMs')}</span>
        </label>
        <input
          id="time"
          type="text"
          inputMode="decimal"
          value={timeText}
          onChange={(e) => handleTimeChange(e.target.value)}
        />
      </div>

      <div className={fieldClass('place')}>
        <label htmlFor="place">
          등수 (Place) {warning('place')}
          <span className="confidence">{confidencePct(race, 'place')}</span>
        </label>
        <input
          id="place"
          type="number"
          value={race.place ?? ''}
          onChange={(e) =>
            onChange({
              ...race,
              place: e.target.value === '' ? undefined : Number(e.target.value),
            })
          }
        />
      </div>

      <button type="button" onClick={() => onConfirm(race)}>
        확정 (Confirm)
      </button>
    </section>
  );
}

export default ReviewRace;

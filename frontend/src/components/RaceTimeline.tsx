import { formatMsToTime } from '../lib/time';
import type { PortfolioBundle, Stroke } from '../types';

const STROKE_KO: Record<Stroke, string> = {
  FR: '자유형', BK: '배영', BR: '평영', FL: '접영', IM: '개인혼영',
};

const FLAG: Record<string, string> = { KR: '🇰🇷', US: '🇺🇸', JP: '🇯🇵' };

/**
 * 한·미 통합 타임라인 — 두 시스템(한국 대회 ↔ 미국 대회)의 기록을 한 줄기로.
 * 경쟁 앱이 못 보는 방치 세그먼트/양국 선수를 위한 차별 화면.
 */
export function RaceTimeline({ bundle }: { bundle: PortfolioBundle }) {
  const items = [...bundle.races]
    .map((r) => ({ r, meet: bundle.meets[r.meetId] }))
    .filter((x) => x.meet)
    .sort((a, b) => b.meet!.date.localeCompare(a.meet!.date)); // 최신순

  return (
    <ol className="timeline" aria-label="기록 타임라인">
      {items.map(({ r, meet }) => (
        <li key={r.id} className="tl-item">
          <span className="tl-flag" aria-label={meet!.country}>{FLAG[meet!.country] ?? '🏁'}</span>
          <div className="tl-body">
            <div className="tl-top">
              <span className="tl-event">
                {r.distance} {STROKE_KO[r.stroke]} <span className="course">{r.course}</span>
              </span>
              <span className="tl-time">
                {formatMsToTime(r.timeMs)}
                {r.isPB && <span className="pb-tag">PB</span>}
              </span>
            </div>
            <div className="tl-meta">
              {meet!.date} · {meet!.name}
              {r.place && <span className="tl-place"> · {r.place}위</span>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default RaceTimeline;

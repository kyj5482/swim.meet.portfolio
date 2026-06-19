import { formatMsToTime } from '../lib/time';
import { useI18n } from '../i18n';
import type { PortfolioBundle } from '../types';

/** 기록 타임라인 — 모든 대회 기록을 최신순으로. (대회 종류·수준 무관하게 한 곳에 누적) */
export function RaceTimeline({ bundle }: { bundle: PortfolioBundle }) {
  const { t } = useI18n();
  const items = [...bundle.races]
    .map((r) => ({ r, meet: bundle.meets[r.meetId] }))
    .filter((x) => x.meet)
    .sort((a, b) => b.meet!.date.localeCompare(a.meet!.date)); // 최신순

  return (
    <ol className="timeline" aria-label="record timeline">
      {items.map(({ r, meet }) => (
        <li key={r.id} className="tl-item">
          <div className="tl-body">
            <div className="tl-top">
              <span className="tl-event">
                {r.distance} {t(`stroke.${r.stroke}`)} <span className="course">{r.course}</span>
              </span>
              <span className="tl-time">
                {formatMsToTime(r.timeMs)}
                {r.isPB && <span className="pb-tag">PB</span>}
              </span>
            </div>
            <div className="tl-meta">
              {meet!.date} · {meet!.name}
              {r.place && <span className="tl-place"> · {r.place}</span>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default RaceTimeline;

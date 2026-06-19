import { formatMsToTime } from '../lib/time';
import { tierForTime, type StandardLine } from '../lib/standards';
import { bestTimesByEvent } from '../lib/portfolio';
import { useI18n } from '../i18n';
import type { PortfolioBundle } from '../types';

export interface BestTimesBoardProps {
  bundle: PortfolioBundle;
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

/**
 * 종목별 최고기록 보드 — 경쟁 앱(Swimmetry)의 베스트 타임을 벤치마킹하고,
 * 기준 대비 등급(B~AAAA)을 컬러 칩으로(히트맵), 최초 대비 향상%를 함께 보여준다.
 */
export function BestTimesBoard({ bundle, selectedKey, onSelect }: BestTimesBoardProps) {
  const { t } = useI18n();
  const meetDate = (id: string) => bundle.meets[id]?.date ?? '';
  const rows = bestTimesByEvent(bundle.races, (r) => meetDate(r.meetId));

  return (
    <table className="best-times" aria-label="best times">
      <thead>
        <tr>
          <th>{t('pf.col.event')}</th>
          <th>{t('pf.col.best')}</th>
          <th>{t('pf.col.tier')}</th>
          <th>{t('pf.col.improve')}</th>
          <th>{t('pf.col.count')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((e) => {
          const std = (bundle.standards[e.key] ?? []) as StandardLine[];
          const tier = tierForTime(e.best.timeMs, std);
          const improved = e.improvementPct > 0;
          const selected = e.key === selectedKey;
          return (
            <tr
              key={e.key}
              className={selected ? 'row selected' : 'row'}
              onClick={() => onSelect(e.key)}
              tabIndex={0}
              role="button"
              aria-pressed={selected}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') onSelect(e.key);
              }}
            >
              <td>
                {e.distance} {t(`stroke.${e.stroke}`)} <span className="course">{e.course}</span>
                {e.best.isPB && <span className="pb-tag">PB</span>}
              </td>
              <td className="time">{formatMsToTime(e.best.timeMs)}</td>
              <td>
                {tier.achieved ? (
                  <span className={`tier tier-${tier.achieved}`}>{tier.achieved}</span>
                ) : std.length ? (
                  <span className="tier tier-none">미달</span>
                ) : (
                  <span className="tier tier-na" title="기준 없음(방치 세그먼트)">—</span>
                )}
              </td>
              <td className={improved ? 'delta up' : 'delta'}>
                {e.improvementPct === 0 ? '—' : `${improved ? '▼' : '▲'} ${Math.abs(e.improvementPct).toFixed(1)}%`}
              </td>
              <td>{e.count}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default BestTimesBoard;

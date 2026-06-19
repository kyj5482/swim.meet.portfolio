import { formatMsToTime } from '../lib/time';
import { tierForTime, type StandardLine } from '../lib/standards';
import { ageGroupBreakdown, improvementRate, rateCategory } from '../lib/ageAnalysis';
import { progressionFor } from '../lib/portfolio';
import { useI18n } from '../i18n';
import type { PortfolioBundle } from '../types';

/**
 * 나이 그룹별 기록 수준 + 향상 속도 분석.
 * 대회는 나이대로 나뉘고 그 수준이 종단으로 안 남는 문제를 보완 →
 * 나이 그룹마다 최고기록·등급을 보존하고, 기록이 얼마나 빨리 좋아지는지(월 향상%)를 보여준다.
 */
export function AgeGroupAnalysis({ bundle, eventKey: key }: { bundle: PortfolioBundle; eventKey: string }) {
  const { t } = useI18n();
  const meetDate = (id: string) => bundle.meets[id]?.date ?? '';
  const groups = ageGroupBreakdown(bundle.races, key, bundle.athlete.birthDate, (r) => meetDate(r.meetId));
  if (groups.length === 0) return null;

  const points = progressionFor(bundle.races, key, (r) => meetDate(r.meetId));
  const rate = improvementRate(points);
  const ageStd = bundle.ageStandards?.[key];

  return (
    <div className="age-analysis">
      <div className="rate-card">
        <div className="rate-main">
          <span className="rate-label">{t('pf.rate.title')}</span>
          <strong className="rate-value">{t(`pf.rate.${rateCategory(rate.pctPerMonth)}`)}</strong>
        </div>
        <div className="rate-detail">
          {t('pf.rate.detail', {
            months: Math.round(rate.months),
            total: rate.totalPct.toFixed(1),
            perMonth: rate.pctPerMonth.toFixed(2),
          })}
        </div>
      </div>

      <table className="age-table" aria-label="age group records">
        <thead>
          <tr>
            <th>{t('pf.col.ageGroup')}</th>
            <th>{t('pf.col.best')}</th>
            <th>{t('pf.col.groupTier')}</th>
            <th>{t('pf.col.groupImprove')}</th>
            <th>{t('pf.col.count')}</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const lines = (ageStd?.[g.ageGroup] ?? bundle.standards[key] ?? []) as StandardLine[];
            const tier = tierForTime(g.best.timeMs, lines);
            const improved = g.improvementPct > 0;
            return (
              <tr key={g.ageGroup}>
                <td className="ag-name">{g.ageGroup}</td>
                <td className="time">{formatMsToTime(g.best.timeMs)}</td>
                <td>
                  {tier.achieved ? (
                    <span className={`tier tier-${tier.achieved}`}>{tier.achieved}</span>
                  ) : lines.length ? (
                    <span className="tier tier-none">-</span>
                  ) : (
                    <span className="tier tier-na">—</span>
                  )}
                </td>
                <td className={improved ? 'delta up' : 'delta'}>
                  {g.count < 2 ? '—' : `▼ ${Math.abs(g.improvementPct).toFixed(1)}%`}
                </td>
                <td>{g.count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="age-note">{t('pf.ageNote')}</p>
    </div>
  );
}

export default AgeGroupAnalysis;

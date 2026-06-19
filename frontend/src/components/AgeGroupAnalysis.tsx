import { formatMsToTime } from '../lib/time';
import { tierForTime, type StandardLine } from '../lib/standards';
import { ageGroupBreakdown, improvementRate, rateLabel } from '../lib/ageAnalysis';
import { progressionFor } from '../lib/portfolio';
import type { PortfolioBundle } from '../types';

/**
 * 나이 그룹별 기록 수준 + 향상 속도 분석.
 * 대회는 나이대로 나뉘고 그 수준이 종단으로 안 남는 문제를 보완 →
 * 나이 그룹마다 최고기록·등급을 보존하고, 기록이 얼마나 빨리 좋아지는지(월 향상%)를 보여준다.
 */
export function AgeGroupAnalysis({ bundle, eventKey: key }: { bundle: PortfolioBundle; eventKey: string }) {
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
          <span className="rate-label">향상 속도</span>
          <strong className="rate-value">{rateLabel(rate.pctPerMonth)}</strong>
        </div>
        <div className="rate-detail">
          {rate.months >= 1 ? `${Math.round(rate.months)}개월간 ` : ''}
          총 {rate.totalPct.toFixed(1)}% 향상 · 월 평균 {rate.pctPerMonth.toFixed(2)}%
        </div>
      </div>

      <table className="age-table" aria-label="나이 그룹별 기록">
        <thead>
          <tr>
            <th>나이 그룹</th>
            <th>최고기록</th>
            <th>그룹 등급</th>
            <th>그룹 내 향상</th>
            <th>횟수</th>
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
                    <span className="tier tier-none">미달</span>
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
      <p className="age-note">
        대회는 나이대로 나뉩니다. 각 나이 그룹에서의 기록·등급을 잃지 않고 보존해
        성장 궤적을 한눈에 볼 수 있어요.
      </p>
    </div>
  );
}

export default AgeGroupAnalysis;

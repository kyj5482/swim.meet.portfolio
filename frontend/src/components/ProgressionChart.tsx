import { formatMsToTime } from '../lib/time';
import { progressionFor, improvementPct } from '../lib/portfolio';
import { useI18n } from '../i18n';
import type { PortfolioBundle } from '../types';

/**
 * 진척 그래프 — 선택한 종목의 기록 변화(시간순). 경쟁 앱의 progression graph
 * 벤치마킹. 외부 차트 라이브러리 없이 가벼운 SVG로(번들 절약). 아래로 갈수록 빠름.
 */
export function ProgressionChart({ bundle, eventKey: key }: { bundle: PortfolioBundle; eventKey: string }) {
  const { t } = useI18n();
  const pts = progressionFor(bundle.races, key, (r) => bundle.meets[r.meetId]?.date ?? '');
  if (pts.length < 2) {
    return <p className="chart-empty">{t('pf.noChart')}</p>;
  }

  const W = 320;
  const H = 140;
  const pad = 28;
  const times = pts.map((p) => p.timeMs);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min || 1;

  // x: 균등 간격, y: 느림(위)~빠름(아래는 좋음). 빠를수록(작은 ms) 위로 = 향상 우상향.
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (pts.length - 1);
  const y = (ms: number) => pad + ((ms - min) / span) * (H - 2 * pad);

  const line = pts.map((p, i) => `${x(i)},${y(p.timeMs)}`).join(' ');
  const totalImpr = improvementPct(pts[0].timeMs, pts[pts.length - 1].timeMs);

  return (
    <div className="progression">
      <div className="prog-head">
        <strong>{key.replace(/-/g, ' ')}</strong>
        <span className={totalImpr > 0 ? 'delta up' : 'delta'}>
          {totalImpr > 0 ? '▼' : '▲'} {Math.abs(totalImpr).toFixed(1)}% {totalImpr > 0 ? t('pf.improved') : ''}
        </span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="진척 그래프">
        <polyline className="prog-line" fill="none" points={line} />
        {pts.map((p, i) => (
          <g key={i}>
            <circle className={p.isPB ? 'prog-dot pb' : 'prog-dot'} cx={x(i)} cy={y(p.timeMs)} r={4} />
            <title>{`${p.date}: ${formatMsToTime(p.timeMs)}${p.isPB ? ' (PB)' : ''}`}</title>
          </g>
        ))}
      </svg>
      <div className="prog-foot">
        <span>{pts[0].date} · {formatMsToTime(pts[0].timeMs)}</span>
        <span>→ {pts[pts.length - 1].date} · {formatMsToTime(pts[pts.length - 1].timeMs)}</span>
      </div>
    </div>
  );
}

export default ProgressionChart;

import { formatMsToTime } from '../lib/time';
import { progressionFor, improvementPct } from '../lib/portfolio';
import { useI18n } from '../i18n';
import type { PortfolioBundle } from '../types';

/**
 * 진척 그래프 — 선택한 종목의 기록 변화(시간순). (docs/10-design-guide.md §6)
 * 직관화: y축 "빠를수록 위 ↑" 라벨 + 수평 격자선 + 선 아래 면적 채움 + PB 금색 링.
 * 외부 차트 라이브러리 없이 SVG 직접(번들 경량).
 */
export function ProgressionChart({ bundle, eventKey: key }: { bundle: PortfolioBundle; eventKey: string }) {
  const { t } = useI18n();
  const pts = progressionFor(bundle.races, key, (r) => bundle.meets[r.meetId]?.date ?? '');
  if (pts.length < 2) {
    return <p className="chart-empty">{t('pf.noChart')}</p>;
  }

  const W = 320;
  const H = 150;
  const pad = 26;
  const baseY = H - pad; // 플롯 하단
  const times = pts.map((p) => p.timeMs);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = max - min || 1;

  // y: 빠를수록(작은 ms) 위로 = 향상 우상향(직관적). x: 균등 간격.
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (pts.length - 1);
  const y = (ms: number) => pad + ((ms - min) / span) * (baseY - pad);

  const line = pts.map((p, i) => `${x(i)},${y(p.timeMs)}`).join(' ');
  const area = `${pad},${baseY} ${line} ${W - pad},${baseY}`;
  const grid = [0, 1, 2, 3].map((g) => pad + (g * (baseY - pad)) / 3);
  const totalImpr = improvementPct(pts[0].timeMs, pts[pts.length - 1].timeMs);

  return (
    <div className="progression">
      <div className="prog-head">
        <strong>{key.replace(/-/g, ' ')}</strong>
        <span className={totalImpr > 0 ? 'delta up' : 'delta'}>
          {totalImpr > 0 ? '▼' : '▲'} {Math.abs(totalImpr).toFixed(1)}% {totalImpr > 0 ? t('pf.improved') : ''}
        </span>
      </div>
      <div className="prog-axis-label">{t('pf.faster')}</div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="progression chart">
        {grid.map((gy, i) => (
          <line key={i} className="prog-grid" x1={pad} y1={gy} x2={W - pad} y2={gy} />
        ))}
        <polygon className="prog-area" points={area} />
        <polyline className="prog-line" fill="none" points={line} />
        {pts.map((p, i) => (
          <g key={i}>
            <circle className={p.isPB ? 'prog-dot pb' : 'prog-dot'} cx={x(i)} cy={y(p.timeMs)} r={p.isPB ? 5.5 : 4} />
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

import type { Badge } from '../types';

/** 뱃지별 이모지(없으면 메달). 컬렉션 욕구 = 리텐션. */
const BADGE_ICON: Record<string, string> = {
  first_splash: '💦',
  pb_machine: '⚡',
  all_four_strokes: '🏊',
  distance_explorer: '🧭',
  centurion: '💯',
  iron_will: '🔥',
};

export function BadgeShelf({ badges }: { badges: Badge[] }) {
  if (badges.length === 0) {
    return <p className="badge-empty">아직 뱃지가 없어요. 첫 기록을 올려보세요!</p>;
  }
  return (
    <ul className="badge-shelf" aria-label="획득 뱃지">
      {badges.map((b) => (
        <li key={b.code} className="badge" title={new Date(b.earnedAt).toLocaleDateString('ko-KR')}>
          <span className="badge-icon" aria-hidden>
            {BADGE_ICON[b.code] ?? '🏅'}
          </span>
          <span className="badge-label">{b.label}</span>
        </li>
      ))}
    </ul>
  );
}

export default BadgeShelf;

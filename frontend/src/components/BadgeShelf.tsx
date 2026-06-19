import { useI18n, type TranslationKey } from '../i18n';
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
  const { t, lang } = useI18n();
  if (badges.length === 0) {
    return <p className="badge-empty">{t('pf.badgeEmpty')}</p>;
  }
  return (
    <ul className="badge-shelf" aria-label="badges">
      {badges.map((b) => {
        // i18n 라벨이 있으면 사용, 없으면 데이터의 라벨로 폴백.
        const key = `badge.${b.code}` as TranslationKey;
        const label = t(key);
        return (
          <li key={b.code} className="badge" title={new Date(b.earnedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR')}>
            <span className="badge-icon" aria-hidden>
              {BADGE_ICON[b.code] ?? '🏅'}
            </span>
            <span className="badge-label">{label === key ? b.label : label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default BadgeShelf;

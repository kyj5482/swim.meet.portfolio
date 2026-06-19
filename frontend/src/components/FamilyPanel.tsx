import { useI18n } from '../i18n';
import type { FamilyMemberView } from '../types';

const MEDAL = ['🥇', '🥈', '🥉'];

/**
 * 가족 포트폴리오 패널 — 형제·자매 레벨 리더보드. 가족이 함께 쌓는 평생 포트폴리오
 * + 선의의 경쟁 = 리텐션. 순위는 gamification-service `/leaderboard` 결과.
 */
export function FamilyPanel({ family }: { family: FamilyMemberView[] }) {
  const { t } = useI18n();
  return (
    <div className="family-panel">
      <h3>{t('pf.family')}</h3>
      <ol className="family-board" aria-label="가족 리더보드">
        {family.map((m) => (
          <li key={m.athleteId} className="fam-row">
            <span className="fam-rank">{MEDAL[m.rank - 1] ?? `${m.rank}위`}</span>
            <span className="fam-name">{m.name}</span>
            <span className="fam-level">Lv.{m.level}</span>
            <span className="fam-xp">{m.xp.toLocaleString()} XP</span>
          </li>
        ))}
      </ol>
      <p className="family-hint">{t('pf.familyHint')}</p>
    </div>
  );
}

export default FamilyPanel;

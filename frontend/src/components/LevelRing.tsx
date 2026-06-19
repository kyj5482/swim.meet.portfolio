import { levelProgress } from '../lib/level';
import type { GamificationProfile } from '../types';

/**
 * 스킬 레벨 링 — "내 수준이 몇 단계인가"를 한눈에. (경쟁 앱에 없는 차별 요소)
 * SVG 원형 진행바로 현재 레벨·다음 레벨까지 진행도·스트릭을 표시.
 */
export function LevelRing({ profile }: { profile: GamificationProfile }) {
  const progress = levelProgress(profile.xp);
  const radius = 46;
  const c = 2 * Math.PI * radius;
  const offset = c * (1 - progress);

  return (
    <div className="level-ring" aria-label={`레벨 ${profile.level}`}>
      <svg width="120" height="120" viewBox="0 0 120 120" role="img">
        <circle cx="60" cy="60" r={radius} className="ring-track" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="ring-progress"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="54" className="ring-level" textAnchor="middle">
          Lv.{profile.level}
        </text>
        <text x="60" y="74" className="ring-xp" textAnchor="middle">
          {profile.xpIntoLevel}/{profile.xpForNextLevel} XP
        </text>
      </svg>
      <div className="streak" title="연속 활동일">
        🔥 {profile.currentStreakDays}일 연속
        <span className="streak-best"> (최장 {profile.longestStreakDays})</span>
      </div>
    </div>
  );
}

export default LevelRing;

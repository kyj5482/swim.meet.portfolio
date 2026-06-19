import { useEffect, useState } from 'react';
import { getPortfolio } from '../api/client';
import { ageFromBirth, bestTimesByEvent } from '../lib/portfolio';
import type { PortfolioBundle } from '../types';
import { LevelRing } from './LevelRing';
import { BadgeShelf } from './BadgeShelf';
import { BestTimesBoard } from './BestTimesBoard';
import { ProgressionChart } from './ProgressionChart';
import { AgeGroupAnalysis } from './AgeGroupAnalysis';
import { RaceTimeline } from './RaceTimeline';
import { FamilyPanel } from './FamilyPanel';

const FLAG: Record<string, string> = { KR: '🇰🇷', US: '🇺🇸', JP: '🇯🇵' };

/**
 * 포트폴리오 화면 — 앱의 핵심. 선수가 평생 쌓는 기록부를 한 화면에 구성한다.
 *  헤더(레벨·스트릭·국기) → 뱃지 → 베스트타임 보드 ↔ 진척 그래프 → 한·미 타임라인 → 가족.
 */
export function Portfolio({ athleteId = 'ath-jiwoo' }: { athleteId?: string }) {
  const [bundle, setBundle] = useState<PortfolioBundle | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getPortfolio(athleteId).then((b) => {
      if (!alive) return;
      setBundle(b);
      // 기록이 가장 많은 종목을 기본 선택(진척 그래프 표시)
      const rows = bestTimesByEvent(b.races, (r) => b.meets[r.meetId]?.date ?? '');
      const top = [...rows].sort((a, b2) => b2.count - a.count)[0];
      setSelectedKey(top?.key ?? null);
    });
    return () => {
      alive = false;
    };
  }, [athleteId]);

  if (!bundle) return <p className="loading">포트폴리오를 불러오는 중…</p>;

  const { athlete, gamification } = bundle;
  const age = ageFromBirth(athlete.birthDate);

  return (
    <div className="portfolio">
      <header className="pf-header">
        <LevelRing profile={gamification} />
        <div className="pf-id">
          <h2>
            {athlete.firstName} {athlete.lastName}{' '}
            {athlete.countryCodes.map((c) => (
              <span key={c} className="flag" aria-label={c}>
                {FLAG[c] ?? '🏁'}
              </span>
            ))}
          </h2>
          <p className="pf-sub">
            만 {age}세 · {athlete.gender === 'F' ? '여' : athlete.gender === 'M' ? '남' : ''} ·{' '}
            {athlete.clubs.join(' / ')}
          </p>
          <BadgeShelf badges={gamification.badges} />
        </div>
      </header>

      <section className="pf-section">
        <h3>종목별 최고기록 & 등급</h3>
        <div className="pf-grid">
          <BestTimesBoard
            bundle={bundle}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
          {selectedKey && <ProgressionChart bundle={bundle} eventKey={selectedKey} />}
        </div>
      </section>

      {selectedKey && (
        <section className="pf-section">
          <h3>나이 그룹별 기록 수준 & 향상 속도</h3>
          <AgeGroupAnalysis bundle={bundle} eventKey={selectedKey} />
        </section>
      )}

      <section className="pf-section">
        <h3>한·미 통합 타임라인</h3>
        <RaceTimeline bundle={bundle} />
      </section>

      <section className="pf-section">
        <FamilyPanel family={bundle.family} />
      </section>
    </div>
  );
}

export default Portfolio;

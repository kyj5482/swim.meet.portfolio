import { useState } from 'react';
import { Portfolio } from './components/Portfolio';
import { ReviewRace, type ExtractedRace } from './components/ReviewRace';

/** 데모용 추출 결과 — 실제로는 extraction-service 응답으로 채워진다. */
const DEMO_RACE: ExtractedRace = {
  stroke: 'FR',
  distance: 50,
  course: 'SCY',
  timeMs: 28910,
  place: 3,
  fieldConfidence: { stroke: 0.99, distance: 0.98, course: 0.97, timeMs: 0.72, place: 0.95 },
};

type Tab = 'portfolio' | 'upload';

export function App() {
  const [tab, setTab] = useState<Tab>('portfolio');
  const [race, setRace] = useState<ExtractedRace>(DEMO_RACE);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="app">
      <header className="app-bar">
        <span className="brand">🏊 SwimVault</span>
        <nav className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'portfolio'}
            className={tab === 'portfolio' ? 'tab active' : 'tab'}
            onClick={() => setTab('portfolio')}
          >
            포트폴리오
          </button>
          <button
            role="tab"
            aria-selected={tab === 'upload'}
            className={tab === 'upload' ? 'tab active' : 'tab'}
            onClick={() => setTab('upload')}
          >
            기록 추가
          </button>
        </nav>
      </header>

      <main className="app-main">
        {tab === 'portfolio' && <Portfolio />}
        {tab === 'upload' && (
          <section className="upload">
            <h1>추출 결과 확인·수정</h1>
            <p>낮은 신뢰도(&lt;0.8) 필드는 강조됩니다. 수정 후 확정하세요. (P2)</p>
            <ReviewRace race={race} onChange={setRace} onConfirm={() => setConfirmed(true)} />
            {confirmed && <p role="status">확정되었습니다. 포트폴리오에 반영됩니다.</p>}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

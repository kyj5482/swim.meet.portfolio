import { useState } from 'react';
import { useI18n, type TranslationKey } from './i18n';
import { useAuth } from './auth/AuthContext';
import { AuthScreen } from './screens/AuthScreen';
import { Portfolio } from './components/Portfolio';
import { IntakeScreen } from './screens/IntakeScreen';
import { FamilyScreen } from './screens/FamilyScreen';
import { SettingsScreen } from './screens/SettingsScreen';

type Tab = 'portfolio' | 'intake' | 'family' | 'settings';

const NAV: { tab: Tab; key: TranslationKey; icon: string }[] = [
  { tab: 'portfolio', key: 'nav.portfolio', icon: '🏅' },
  { tab: 'intake', key: 'nav.intake', icon: '📷' },
  { tab: 'family', key: 'nav.family', icon: '👨‍👩‍👧' },
  { tab: 'settings', key: 'nav.settings', icon: '⚙️' },
];

export function App() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('portfolio');

  // 미인증 → 로그인/회원가입 게이트
  if (!user) return <AuthScreen />;

  return (
    <div className="app">
      <header className="app-bar">
        <span className="brand">🏊 {t('app.brand')}</span>
      </header>

      <main className="app-main">
        {tab === 'portfolio' && <Portfolio />}
        {tab === 'intake' && <IntakeScreen />}
        {tab === 'family' && <FamilyScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </main>

      <nav className="bottom-nav" role="tablist">
        {NAV.map(({ tab: tb, key, icon }) => (
          <button
            key={tb}
            role="tab"
            aria-selected={tab === tb}
            className={tab === tb ? 'nav-item active' : 'nav-item'}
            onClick={() => setTab(tb)}
          >
            <span className="nav-icon" aria-hidden>{icon}</span>
            <span className="nav-label">{t(key)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;

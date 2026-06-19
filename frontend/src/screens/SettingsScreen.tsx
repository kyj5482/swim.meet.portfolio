import { useI18n, type Lang } from '../i18n';
import { useAuth } from '../auth/AuthContext';

/** 설정 — 언어(영/한) 전환 + 계정/로그아웃. */
export function SettingsScreen() {
  const { t, lang, setLang } = useI18n();
  const { user, logout } = useAuth();

  const langBtn = (l: Lang, label: string) => (
    <button
      className={lang === l ? 'seg active' : 'seg'}
      aria-pressed={lang === l}
      onClick={() => setLang(l)}
    >
      {label}
    </button>
  );

  return (
    <div className="settings">
      <h1>{t('settings.title')}</h1>

      <section className="set-group">
        <h3>{t('settings.language')}</h3>
        <div className="segmented">
          {langBtn('ko', t('settings.korean'))}
          {langBtn('en', t('settings.english'))}
        </div>
      </section>

      <section className="set-group">
        <h3>{t('settings.account')}</h3>
        <p className="set-account">
          {t('settings.loggedInAs')}: <strong>{user?.displayName}</strong>
          <br />
          <span className="muted">{user?.email}</span>
        </p>
        <button className="danger" onClick={logout}>
          {t('settings.logout')}
        </button>
      </section>
    </div>
  );
}

export default SettingsScreen;

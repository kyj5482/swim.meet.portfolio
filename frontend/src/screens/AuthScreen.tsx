import { useState } from 'react';
import { useI18n } from '../i18n';
import { useAuth } from '../auth/AuthContext';

/** 로그인 / 회원가입 화면 — 미인증 시 앱 진입 게이트. */
export function AuthScreen() {
  const { t } = useI18n();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, displayName);
    } catch (err) {
      setError((err as Error).message === 'NEED_FIELDS' ? t('auth.needFields') : t('auth.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <div className="auth-logo">🏊</div>
        <h1>{t('auth.welcome')}</h1>
        <p>{t('auth.tagline')}</p>
      </div>

      <div className="auth-tabs" role="tablist">
        <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>
          {t('auth.login')}
        </button>
        <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')}>
          {t('auth.register')}
        </button>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {mode === 'register' && (
          <label>
            {t('auth.displayName')}
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
          </label>
        )}
        <label>
          {t('auth.email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label>
          {t('auth.password')}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" className="primary" disabled={busy}>
          {mode === 'login' ? t('auth.loginCta') : t('auth.registerCta')}
        </button>
      </form>

      <button className="auth-switch" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? t('auth.toRegister') : t('auth.toLogin')}
      </button>
    </div>
  );
}

export default AuthScreen;

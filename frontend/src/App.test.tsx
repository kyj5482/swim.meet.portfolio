import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { I18nProvider } from './i18n';
import { AuthProvider } from './auth/AuthContext';

function renderApp() {
  return render(
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>,
  );
}

describe('App 인증 게이트', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('swimvault.lang', 'ko'); // jsdom navigator는 en-US → 명시 고정
  });

  it('미로그인 시 로그인 화면을 보여준다', () => {
    renderApp();
    expect(screen.getByText(/환영합니다/)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '회원가입' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('로그인된 사용자가 있으면 하단 내비를 보여준다', () => {
    localStorage.setItem('swimvault.token', 'mock.t');
    localStorage.setItem('swimvault.user', JSON.stringify({ id: 'u1', email: 'a@b.com', displayName: '엄마' }));
    renderApp();
    expect(screen.getByRole('tab', { name: /기록 추가/ })).toBeInTheDocument();
  });
});

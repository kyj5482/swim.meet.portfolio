import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, useI18n } from './index';

function Probe() {
  const { t, lang, setLang } = useI18n();
  return (
    <div>
      <span data-testid="nav">{t('nav.portfolio')}</span>
      <span data-testid="age">{t('pf.age', { n: 10 })}</span>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('en')}>en</button>
      <button onClick={() => setLang('ko')}>ko</button>
    </div>
  );
}

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('swimvault.lang', 'ko'); // jsdom navigator는 en-US → 명시 고정
  });

  it('기본 한국어 + 플레이스홀더 치환', () => {
    render(<I18nProvider><Probe /></I18nProvider>);
    expect(screen.getByTestId('nav').textContent).toBe('포트폴리오');
    expect(screen.getByTestId('age').textContent).toBe('만 10세');
  });

  it('언어 전환 시 텍스트가 영어로 바뀜', () => {
    render(<I18nProvider><Probe /></I18nProvider>);
    fireEvent.click(screen.getByText('en'));
    expect(screen.getByTestId('nav').textContent).toBe('Portfolio');
    expect(screen.getByTestId('age').textContent).toBe('Age 10');
    expect(localStorage.getItem('swimvault.lang')).toBe('en');
  });
});

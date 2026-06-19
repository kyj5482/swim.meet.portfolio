import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Portfolio } from './Portfolio';

// 기본 mock(VITE_USE_MOCK 기본 true) → 시드 포트폴리오를 비동기로 로드.
describe('Portfolio', () => {
  it('선수 헤더·섹션을 비동기로 렌더', async () => {
    render(<Portfolio />);
    expect(screen.getByText(/불러오는 중/)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /지우 Kim/ })).toBeInTheDocument();
    expect(await screen.findByText('종목별 최고기록 & 등급')).toBeInTheDocument();
    expect(await screen.findByText('기록 타임라인')).toBeInTheDocument();
    expect(await screen.findByText('우리 가족 리더보드')).toBeInTheDocument();
  });
});

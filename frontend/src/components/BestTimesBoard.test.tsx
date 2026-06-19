import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BestTimesBoard } from './BestTimesBoard';
import { SEED } from '../data/seed';

describe('BestTimesBoard', () => {
  it('이벤트별 최고기록과 등급 칩을 렌더', () => {
    render(<BestTimesBoard bundle={SEED} selectedKey={null} onSelect={() => {}} />);
    // 50 자유형 SCY 최고기록 33.40 → A 등급(seed 기준: AA 34.0보다 느림, A 36.0 충족)
    expect(screen.getByText('33.40')).toBeInTheDocument();
    expect(screen.getAllByText('AA').length).toBeGreaterThan(0);
  });

  it('향상%를 ▼로 표시(빨라짐)', () => {
    render(<BestTimesBoard bundle={SEED} selectedKey={null} onSelect={() => {}} />);
    // 50FR: 40.10 → 33.40, 약 16.7% 향상
    expect(screen.getByText(/16\.7%/)).toBeInTheDocument();
  });

  it('행 클릭 시 onSelect(eventKey) 호출', () => {
    const onSelect = vi.fn();
    render(<BestTimesBoard bundle={SEED} selectedKey={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('33.40').closest('tr')!);
    expect(onSelect).toHaveBeenCalledWith('FR-50-SCY');
  });
});

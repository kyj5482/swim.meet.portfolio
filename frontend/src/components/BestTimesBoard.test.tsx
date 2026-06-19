import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BestTimesBoard } from './BestTimesBoard';
import { SEED } from '../data/seed';

describe('BestTimesBoard', () => {
  it('이벤트별 최고기록과 등급 칩을 렌더', () => {
    render(<BestTimesBoard bundle={SEED} selectedKey={null} onSelect={() => {}} />);
    // 50 자유형 SCY 최고기록 32.80 → 13-14 기준 A(34.0 충족, AA 32.5 미달)
    const row = screen.getByText('32.80').closest('tr')!;
    expect(within(row).getByText('A')).toBeInTheDocument();
  });

  it('향상%를 ▼로 표시(빨라짐)', () => {
    render(<BestTimesBoard bundle={SEED} selectedKey={null} onSelect={() => {}} />);
    // 50FR: 40.10 → 32.80, 약 18.2% 향상
    expect(screen.getByText(/18\.2%/)).toBeInTheDocument();
  });

  it('행 클릭 시 onSelect(eventKey) 호출', () => {
    const onSelect = vi.fn();
    render(<BestTimesBoard bundle={SEED} selectedKey={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('32.80').closest('tr')!);
    expect(onSelect).toHaveBeenCalledWith('FR-50-SCY');
  });
});

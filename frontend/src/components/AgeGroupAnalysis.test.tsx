import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { AgeGroupAnalysis } from './AgeGroupAnalysis';
import { SEED } from '../data/seed';

describe('AgeGroupAnalysis', () => {
  it('나이 그룹별 행과 향상 속도를 렌더', () => {
    render(<AgeGroupAnalysis bundle={SEED} eventKey="FR-50-SCY" />);
    expect(screen.getByText('향상 속도')).toBeInTheDocument();
    // 3개 나이 그룹이 보존됨
    expect(screen.getByText('10&U')).toBeInTheDocument();
    expect(screen.getByText('11-12')).toBeInTheDocument();
    expect(screen.getByText('13-14')).toBeInTheDocument();
  });

  it('나이 그룹별 등급은 그 그룹 기준으로 판정', () => {
    render(<AgeGroupAnalysis bundle={SEED} eventKey="FR-50-SCY" />);
    // 11-12: 최고 34.90, 11-12 기준 AA(35.0) 충족
    const row = screen.getByText('11-12').closest('tr')!;
    expect(within(row).getByText('AA')).toBeInTheDocument();
    expect(within(row).getByText('34.90')).toBeInTheDocument();
  });

  it('기록이 없는 종목이면 아무것도 렌더하지 않음', () => {
    const { container } = render(<AgeGroupAnalysis bundle={SEED} eventKey="ZZ-999-SCY" />);
    expect(container.firstChild).toBeNull();
  });
});

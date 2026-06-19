import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LevelRing } from './LevelRing';
import { SEED } from '../data/seed';

describe('LevelRing', () => {
  it('레벨과 스트릭을 표시', () => {
    render(<LevelRing profile={SEED.gamification} />);
    expect(screen.getByText('Lv.4')).toBeInTheDocument();
    expect(screen.getByText(/5일 연속/)).toBeInTheDocument();
  });
});

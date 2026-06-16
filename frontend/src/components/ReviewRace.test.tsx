import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewRace, type ExtractedRace } from './ReviewRace';

function makeRace(overrides: Partial<ExtractedRace> = {}): ExtractedRace {
  return {
    stroke: 'FR',
    distance: 50,
    course: 'SCY',
    timeMs: 28910,
    place: 3,
    fieldConfidence: { timeMs: 0.72, place: 0.95, stroke: 0.99 },
    ...overrides,
  };
}

describe('ReviewRace', () => {
  it('highlights low-confidence fields with warning marker and class', () => {
    render(
      <ReviewRace race={makeRace()} onChange={() => {}} onConfirm={() => {}} />,
    );

    // 시간(timeMs) 신뢰도 0.72 < 0.8 → 강조 + ⚠
    const timeInput = screen.getByLabelText(/기록/i);
    const timeField = timeInput.closest('.field');
    expect(timeField).toHaveClass('low-confidence');
    expect(screen.getByRole('alert', { name: /low confidence/i })).toBeInTheDocument();

    // 등수(place) 신뢰도 0.95 → 강조 안 됨
    const placeInput = screen.getByLabelText(/등수/i);
    expect(placeInput.closest('.field')).not.toHaveClass('low-confidence');
  });

  it('renders the time via formatMsToTime', () => {
    render(
      <ReviewRace race={makeRace()} onChange={() => {}} onConfirm={() => {}} />,
    );
    expect(screen.getByLabelText(/기록/i)).toHaveValue('28.91');
  });

  it('calls onChange when editing the time input', () => {
    const onChange = vi.fn();
    render(
      <ReviewRace race={makeRace()} onChange={onChange} onConfirm={() => {}} />,
    );

    fireEvent.change(screen.getByLabelText(/기록/i), {
      target: { value: '1:02.34' },
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ timeMs: 62340 }),
    );
  });

  it('calls onConfirm when clicking Confirm', () => {
    const onConfirm = vi.fn();
    const race = makeRace();
    render(<ReviewRace race={race} onChange={() => {}} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole('button', { name: /확정/i }));
    expect(onConfirm).toHaveBeenCalledWith(race);
  });
});

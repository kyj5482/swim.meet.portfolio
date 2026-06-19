import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntakeScreen } from './IntakeScreen';

// mock 추출(샘플)은 등록 아이 2명(지우/민준) + 외부 선수 2명을 반환한다.
describe('IntakeScreen — 사진 결과지', () => {
  it('등록된 아이만 매칭하고 외부 선수는 분리한다', async () => {
    render(<IntakeScreen />);
    fireEvent.click(screen.getByText('샘플 결과지로 시연'));

    // 매칭된 우리 아이
    expect(await screen.findByText(/매칭된 기록/)).toBeInTheDocument();
    expect(screen.getByText(/지우 Kim/)).toBeInTheDocument();
    expect(screen.getByText(/민준 Kim/)).toBeInTheDocument();
    // 매칭되지 않은 외부 선수(저장 안 함)
    expect(screen.getByText(/매칭되지 않은 기록/)).toBeInTheDocument();
    expect(screen.getByText(/Emily Chen/)).toBeInTheDocument();
  });

  it('전체 확정 시 추가된 건수를 알린다', async () => {
    const onConfirmed = vi.fn();
    render(<IntakeScreen onConfirmed={onConfirmed} />);
    fireEvent.click(screen.getByText('샘플 결과지로 시연'));
    fireEvent.click(await screen.findByText(/전체 확정/));
    expect(onConfirmed).toHaveBeenCalledWith(2);
    expect(await screen.findByText(/2건의 기록이 포트폴리오에 추가/)).toBeInTheDocument();
  });
});

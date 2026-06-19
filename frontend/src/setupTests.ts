import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// 각 테스트 후 렌더된 DOM 정리(중복 렌더 누적 방지).
afterEach(() => cleanup());

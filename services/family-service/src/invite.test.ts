import { generateInviteCode, expiryFrom, isExpired } from './invite.js';

describe('invite 헬퍼', () => {
  it('초대 코드는 8자, 혼동 문자 제외', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
    expect(code).not.toMatch(/[O01I]/);
  });

  it('만료시각은 now + ttl', () => {
    const now = new Date('2026-06-19T00:00:00.000Z');
    expect(expiryFrom(now, 1000)).toBe('2026-06-19T00:00:01.000Z');
  });

  it('isExpired 경계', () => {
    const exp = '2026-06-19T00:00:00.000Z';
    expect(isExpired(exp, new Date('2026-06-18T23:59:59Z'))).toBe(false);
    expect(isExpired(exp, new Date('2026-06-19T00:00:01Z'))).toBe(true);
  });
});

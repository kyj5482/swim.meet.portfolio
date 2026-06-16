import { validateEmail, validatePasswordStrength } from './auth.js';

describe('validateEmail', () => {
  it('accepts valid addresses', () => {
    expect(validateEmail('a@b.com')).toBe(true);
    expect(validateEmail('kyj5482@gmail.com')).toBe(true);
  });

  it('rejects invalid addresses', () => {
    expect(validateEmail('nope')).toBe(false);
    expect(validateEmail('a@b')).toBe(false);
    expect(validateEmail('a @b.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePasswordStrength', () => {
  it('rejects under 8 chars (boundary 7)', () => {
    expect(validatePasswordStrength('1234567').ok).toBe(false);
  });

  it('accepts exactly 8 chars (boundary 8)', () => {
    expect(validatePasswordStrength('12345678').ok).toBe(true);
  });

  it('accepts longer', () => {
    expect(validatePasswordStrength('supersecret').ok).toBe(true);
  });
});

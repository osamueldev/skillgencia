import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../src/lib/server/crypto';

process.env.ENCRYPTION_KEY = 'a'.repeat(64); // 32 bytes hex = 64 chars

describe('crypto', () => {
  it('encrypts and decrypts a string round-trip', () => {
    const original = 'EAABsbCS1iHg_test_access_token_12345';
    const encrypted = encrypt(original);
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(':');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('produces different ciphertext for same input', () => {
    const text = 'same_token';
    const a = encrypt(text);
    const b = encrypt(text);
    expect(a).not.toBe(b);
  });
});

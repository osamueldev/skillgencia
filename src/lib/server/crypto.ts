import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ENCRYPTION_KEY } from '$env/static/private';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const key = (ENCRYPTION_KEY ?? '').trim();
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(key, 'hex');
}

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const key = getKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted text format');
  const [ivHex, authTagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

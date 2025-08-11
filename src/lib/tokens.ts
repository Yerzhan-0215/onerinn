// src/lib/tokens.ts
import crypto from 'crypto';

/**
 * 生成随机重置令牌（hex 字符串）。
 * @param bytes 随机字节长度（默认 48 → 96 字符的 hex）
 */
export function generateToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 *（可选）生成带过期时间的令牌对象，便于直接入库。
 * @param ttlMs 令牌有效期（毫秒），默认 60 分钟
 */
export function generateExpiringToken(ttlMs = 60 * 60 * 1000) {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + ttlMs);
  return { token, expiresAt };
}

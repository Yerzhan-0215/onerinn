// src/lib/resetTokens.ts
import crypto from 'crypto';

type TokenRecord = {
  hash: string;            // sha256(tokenPlain)
  emailOrPhone: string;    // 绑定的账号标识（示例）
  expiresAt: number;       // 过期时间戳
  used: boolean;           // 是否已使用
};

// 内存存储：生产改 DB/Redis
const store = new Map<string, TokenRecord>(); // key = hash

export function createToken(emailOrPhone: string, ttlMs = 1000 * 60 * 30) {
  const tokenPlain = crypto.randomBytes(32).toString('hex');
  const hash = sha256(tokenPlain);
  store.set(hash, {
    hash,
    emailOrPhone,
    expiresAt: Date.now() + ttlMs,
    used: false
  });
  return tokenPlain; // 仅通过邮件/短信发送给用户
}

export function verifyAndUseToken(tokenPlain: string) {
  const hash = sha256(tokenPlain);
  const rec = store.get(hash);
  if (!rec) return { ok: false, reason: 'NOT_FOUND' as const };
  if (rec.used) return { ok: false, reason: 'USED' as const };
  if (Date.now() > rec.expiresAt) {
    store.delete(hash);
    return { ok: false, reason: 'EXPIRED' as const };
  }
  // 标记已使用（一次性）
  rec.used = true;
  store.set(hash, rec);
  return { ok: true, emailOrPhone: rec.emailOrPhone };
}

function sha256(v: string) {
  return crypto.createHash('sha256').update(v).digest('hex');
}

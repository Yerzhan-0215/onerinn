// src/lib/mail.ts
import nodemailer from 'nodemailer';

/**
 * 创建并返回一个 Nodemailer 传输器。
 * 需要的环境变量（.env.local）：
 *  - SMTP_HOST
 *  - SMTP_PORT
 *  - SMTP_USER
 *  - SMTP_PASS
 *  - SMTP_FROM（可选，默认 "Onerinn <no-reply@onerinn.com>"）
 */
export function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP env missing: please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local'
    );
  }

  // 465 端口为 SSL（secure=true）；587/25 通常为 STARTTLS（secure=false）
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * 发送“重置密码”邮件
 * @param to 收件人邮箱
 * @param resetUrl 点击跳转的重置链接
 */
export async function sendResetEmail(to: string, resetUrl: string) {
  const from = process.env.SMTP_FROM || 'Onerinn <no-reply@onerinn.com>';
  const transporter = getTransport();

  const text = [
    'Reset your Onerinn password',
    '',
    'Click the link below to set a new password (valid for 60 minutes):',
    resetUrl,
    '',
    'If you did not request this, you can ignore this email.',
  ].join('\n');

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.6; color:#0f172a;">
      <h2 style="margin:0 0 12px;">Reset your Onerinn password</h2>
      <p style="margin:0 0 12px;">Click the button below to set a new password (valid for 60 minutes):</p>
      <p style="margin:16px 0;">
        <a href="${resetUrl}"
           style="display:inline-block;padding:10px 16px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;">
          Reset Password
        </a>
      </p>
      <p style="margin:12px 0;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break:break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
      <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0;" />
      <p style="font-size:12px;color:#64748b;margin:0;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your Onerinn password',
    text,
    html,
  });
}

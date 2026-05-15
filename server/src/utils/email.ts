import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationEmail = async (to: string, name: string, token: string) => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verify your PollStar email',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 48px 32px; border-radius: 8px;">
        <h1 style="font-family: Georgia, serif; font-size: 32px; color: #1A1A1A; margin-bottom: 8px;">POLL—STAR</h1>
        <p style="color: #6B6B6B; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 32px;">投票 · HOSHI</p>
        <h2 style="font-family: Georgia, serif; font-size: 24px; color: #1A1A1A; margin-bottom: 16px;">Welcome, ${name}.</h2>
        <p style="color: #1A1A1A; line-height: 1.6; margin-bottom: 32px;">
          Please verify your email address to activate your PollStar account and begin creating polls.
        </p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#C41E3A;color:white;text-decoration:none;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">
          VERIFY EMAIL →
        </a>
        <p style="color: #6B6B6B; font-size: 13px; margin-top: 32px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E2DDD6; margin: 32px 0;" />
        <p style="color: #6B6B6B; font-size: 12px;">© 2025 PollStar. All rights reserved.</p>
      </div>
    `,
  });
};

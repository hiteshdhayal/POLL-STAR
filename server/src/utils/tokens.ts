import crypto from 'crypto';

export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const hashIP = (ip: string) => {
  return crypto.createHash('sha256').update(ip).digest('hex');
};

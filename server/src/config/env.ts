import { cleanEnv, str, port, url } from 'envalid';
import 'dotenv/config';

export const env = cleanEnv(process.env, {
  DATABASE_URL: url(),
  JWT_ACCESS_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_REDIRECT_URI: str(),
  RESEND_API_KEY: str(),
  CLIENT_URL: url(),
  PORT: port({ default: 5000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  EMAIL_FROM: str({ default: 'noreply@pollstar.app' }),
});

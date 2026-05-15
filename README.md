# PollStar — 投票 · HOSHI

> A production-grade full-stack polling platform with an editorial Japanese-minimalist aesthetic. Built for clarity, speed, and real-time collective insights.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?&logo=Socket.io&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Secure Authentication** | Email/password + Google OAuth. JWT access/refresh rotation with `httpOnly`, `secure`, and `sameSite` cookies. |
| 📊 **Dynamic Poll Builder** | Multi-question support, mandatory/optional toggles, anonymous or authenticated response modes, and custom expiry timestamps. |
| 🌐 **Cryptographic Share Links** | Unique `shareToken` per poll for safe, trackable public distribution. |
| ⚡ **Real-Time Analytics** | Socket.io powered live response counters and option breakdowns. Updates push instantly to all viewers. |
| 📈 **Analytics Dashboard** | Question-wise summaries, participation rates, percentage breakdowns, and one-click result publishing. |
| 🎨 **Editorial UI/UX** | Japanese-minimalist design system (`Playfair Display` + `DM Sans`). High-contrast cream/charcoal/crimson palette with smooth fade-up animations. |
| 🛡️ **Security-First** | `Zod` schema validation, rate limiting, hashed IP/session deduplication for anonymous polls, strict CORS, `helmet`, and environment validation. |

---

## 🗃️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Vite, React 19, TypeScript, Tailwind CSS v3, TanStack Query, Zustand, Socket.io-client, Recharts, React Hook Form, Lucide React |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM (PostgreSQL), Socket.io, JSON Web Tokens, bcrypt, Resend, Google OAuth |
| **Security** | `express-rate-limit`, `helmet`, `cors`, `httpOnly/secure` cookies, hashed refresh tokens, IP hashing for anonymous tracking |
| **Tooling** | ESLint, TypeScript `strict` mode, `dotenv`, `envalid`, `ts-node-dev` |

---

## 🚀 Quick Start

### Prerequisites
- Node.js `18+`
- PostgreSQL `14+`
- `npm` or `pnpm`
- Resend API Key (for transactional emails)
- Google Cloud Console OAuth 2.0 Credentials

### 1. Clone & Install
```bash
git clone https://github.com/your-username/pollstar.git
cd pollstar
```

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your credentials
npm install
npx prisma db push
npm run dev
```
✅ Server runs at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../client
cp .env.example .env
# Edit .env with VITE_API_URL & VITE_SOCKET_URL
npm install
npm run dev
```
✅ App runs at `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pollstar
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
RESEND_API_KEY=re_your_resend_api_key
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
EMAIL_FROM=noreply@pollstar.app
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📡 API & Real-Time Events

### REST Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create account & send verification email |
| `POST` | `/api/auth/login` | ❌ | Authenticate & issue tokens |
| `GET`  | `/api/auth/me` | ✅ | Get current user profile |
| `POST` | `/api/polls` | ✅ | Create a new poll |
| `GET`  | `/api/polls/mine` | ✅ | Get creator's polls |
| `GET`  | `/api/polls/:shareToken/public` | ❌ | Get poll for public response |
| `POST` | `/api/responses/:shareToken` | ❌ | Submit response (anon or auth) |
| `GET`  | `/api/analytics/:pollId` | ✅ | Get detailed results & charts |
| `POST` | `/api/polls/:id/publish` | ✅ | Publish results publicly |

### Socket.io Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join:poll` | Client → Server | `pollId` | Join poll-specific WebSocket room |
| `leave:poll` | Client → Server | `pollId` | Leave room on unmount |
| `response:new` | Server → Client | `{ totalResponses, questionUpdates }` | Triggered on new submission |
| `poll:published` | Server → Client | `{ pollId }` | Triggered when creator publishes results |

---

## 🏗️ Architecture Overview

```
client/
├── src/
│   ├── api/          # Axios instance + typed API clients
│   ├── components/   # Reusable UI (Navbar, Modals, Charts, Form Builders)
│   ├── hooks/        # useAuth, usePollSocket (Socket.io integration)
│   ├── pages/        # Route-level views (Auth, Dashboard, Polls, Analytics)
│   └── store/        # Zustand auth & UI state
server/
├── src/
│   ├── config/       # Env, Prisma, Socket.io setup
│   ├── middleware/   # Auth, Error Handling, Rate Limiting
│   └── modules/      # Domain-driven: auth/, polls/, responses/, analytics/
├── prisma/schema.prisma
└── package.json
```

- **Clean Layering:** `routes → controllers → services → repositories` pattern ensures testability and separation of concerns.
- **Prisma Transactions:** All mutations wrapped in `$transaction` for atomicity.
- **Dual-Token Auth:** Short-lived access tokens (15m) + long-lived refresh tokens (7d) with server-side rotation and revocation.
- **Anonymous Protection:** Hashed IP + session ID tracking prevents duplicate anonymous submissions without requiring accounts.

---

## 🛡️ Security Highlights

| Practice | Implementation |
|----------|----------------|
| **Password Security** | `bcrypt` cost factor 12 + strict Zod regex validation |
| **Token Safety** | `httpOnly`, `secure`, `sameSite: lax` cookies. Access tokens never touch `localStorage`. |
| **Rate Limiting** | `20 req/15m` on auth endpoints, `100 req/15m` globally |
| **Input Validation** | Strict `Zod` schemas on every route. `.trim()` and regex enforced. |
| **Environment** | `envalid` crashes server at startup if critical vars are missing |
| **CORS** | Strict origin matching. Allows Vercel previews & localhost only. |

---

## 🌍 Deployment

### Backend (Render / Railway / Heroku)
1. Set environment variables in your hosting dashboard.
2. Run `npm install && npx prisma db push && npm run build`
3. Start with `npm start`

### Frontend (Vercel / Netlify)
1. Connect your `client/` directory.
2. Add `VITE_API_URL` and `VITE_SOCKET_URL` as build variables.
3. Deploy. Vercel automatically handles routing.

> 💡 **Tip:** Ensure `CLIENT_URL` in the backend matches your production frontend URL, and `GOOGLE_REDIRECT_URI` points to your live backend callback endpoint.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with precision. Designed for clarity.* 🎌✨

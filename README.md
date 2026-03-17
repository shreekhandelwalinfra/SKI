# SKI — Shree Khandelwal Infra

A real-estate MLM platform with admin and user dashboards, investment management, team referral tracking, compensation engine, support tickets, and property listings.

## Architecture

```
ski-shree-khandelwal-infra/
├── backend/           # Express.js + Prisma + PostgreSQL
└── frontend/          # Next.js 15 (App Router) + SWR + Socket.io
```

| Layer | Technology | Port |
|-------|-----------|------|
| Frontend | Next.js 15, TypeScript, SWR, Socket.io | 3000 |
| Backend | Express.js, TypeScript, Prisma, Socket.io | 5000 |
| Database | PostgreSQL | 5432 |

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # Edit with your DB credentials
npx prisma generate
npx prisma migrate dev
npx ts-node src/scripts/seedRankConfig.ts
npx ts-node src/scripts/seed-admin.ts
npm run dev                  # → http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # Set NEXT_PUBLIC_API_URL
npm run dev                         # → http://localhost:3000
```

## Features

### Admin Panel (`/admin`)
- **Dashboard** — Overview stats (users, investments, revenue)
- **Activation** — Approve/block pending users (real-time with SWR + Socket.io)
- **User Management** — View user tree, update balances
- **Investments** — Approve/reject investment submissions (triggers compensation cascade)
- **Property Deals** — Track installments per property
- **Profit Center** — Firm profit, team bonus breakdown, user income report
- **Support** — Reply to tickets, real-time chat-style messaging
- **Audit Logs** — Track all admin actions

### User Panel (`/user`)
- **Dashboard** — Rank, income summary, referral link
- **Team** — Nested referral tree visualization
- **Investments** — Submit new investments, track status
- **Profit** — Self reward, team bonus, direct bonus breakdown
- **Profile** — Personal info, bank details, password change
- **Support** — Create tickets, real-time chat with admin

### Public Pages
- Property listings with categories
- Blog
- About, Contact, Earning Plan

## MLM Business Logic

The compensation engine (`backend/src/services/compensationEngine.ts`) handles:

1. **10-Tier Rank System** — Based on team business volume and self-investment
2. **Direct Bonus** — Percentage of own installments based on rank (3-17%)
3. **Team Bonus** — Differential pass-up through upline chain with true-up
4. **Physical Rewards** — Cumulative rewards at each rank milestone

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:3000
PORT=5000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Project Structure

See [backend/README.md](backend/README.md) for detailed backend folder structure.

```
frontend/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── lib/api.ts      # Admin API functions
│   │   └── [page]/page.tsx # Individual admin pages
│   ├── user/               # User panel pages
│   │   ├── lib/api.ts      # User API functions
│   │   └── [page]/page.tsx # Individual user pages
│   ├── components/         # Marketing/public components (Navbar, Footer, Hero, etc.)
│   ├── lib/                # Shared types and public API functions
│   └── services/           # Service utilities
├── lib/                    # Shared providers (SWR, Socket.io)
├── components/             # Shared components (NotificationBell)
└── public/                 # Static assets
```

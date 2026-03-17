# SKI Backend — Shree Khandelwal Infra

Express.js + Prisma + PostgreSQL + Socket.io backend for the SKI real-estate MLM platform.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Express.js | REST API framework |
| TypeScript | Type safety |
| Prisma | PostgreSQL ORM |
| Socket.io | Real-time events (investments, support tickets, notifications) |
| bcryptjs | Password hashing |
| Cloudinary | Image uploads |
| Zod | Input validation |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection string, JWT secret, etc.

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed rank configuration (required for commission system)
npx ts-node src/scripts/seedRankConfig.ts

# 6. Create admin user
npx ts-node src/scripts/seed-admin.ts

# 7. Start development server
npm run dev
```

## Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma            # Database schema (User, Investment, PropertyDeal, etc.)
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma client instance
│   │   ├── cloudinary.ts        # Cloudinary config
│   │   └── socket.ts            # Socket.io initialization & event helpers
│   ├── controllers/
│   │   ├── admin/               # Admin-side controllers (split by domain)
│   │   │   ├── dashboardController.ts
│   │   │   ├── userManagementController.ts
│   │   │   ├── investmentController.ts
│   │   │   ├── propertyDealController.ts
│   │   │   ├── profitController.ts
│   │   │   ├── supportController.ts
│   │   │   ├── systemController.ts
│   │   │   └── notificationController.ts
│   │   ├── user/                # User-side controllers (split by domain)
│   │   │   ├── dashboardController.ts
│   │   │   ├── teamController.ts
│   │   │   ├── investmentController.ts
│   │   │   ├── supportController.ts
│   │   │   ├── profitController.ts
│   │   │   ├── profileController.ts
│   │   │   └── notificationController.ts
│   │   ├── authController.ts    # Login/register (shared admin + user)
│   │   ├── blogController.ts    # Blog CRUD
│   │   ├── inquiryController.ts # Contact form inquiries
│   │   └── propertyController.ts# Public property listings
│   ├── middleware/
│   │   ├── auth.ts              # JWT auth (protect, adminOnly, requireActive)
│   │   ├── errorHandler.ts      # Global error handler
│   │   └── validate.ts          # Zod validation middleware
│   ├── routes/
│   │   ├── adminRoutes.ts       # /api/admin/*
│   │   ├── userRoutes.ts        # /api/user/*
│   │   ├── authRoutes.ts        # /api/auth/*
│   │   ├── blogRoutes.ts        # /api/blog/*
│   │   ├── inquiryRoutes.ts     # /api/inquiries/*
│   │   └── propertyRoutes.ts    # /api/properties/*
│   ├── services/
│   │   ├── compensationEngine.ts# Core MLM business logic (rank, bonus, rewards)
│   │   ├── notificationService.ts# In-app notification system
│   │   └── adminLogService.ts   # Admin audit logging
│   ├── validators/
│   │   └── auth.validators.ts   # Zod schemas for auth routes
│   ├── scripts/                 # One-off scripts (not used at runtime)
│   │   ├── seed-admin.ts        # Creates the initial admin user
│   │   ├── seedRankConfig.ts    # Populates rank tier config
│   │   ├── cleanupData.ts       # Resets financial data (dev use)
│   │   └── recalculate-all-bonuses.ts # Recalculates all bonuses
│   └── server.ts                # App entry point
└── package.json
```

## Key Concepts

### MLM Compensation Engine (`services/compensationEngine.ts`)

The core business logic that processes installments and distributes bonuses:

1. **Rank Calculation** — Users have a rank (1-10) determined by `MIN(volumeRank, investmentRank)`
2. **Direct Bonus** — When user pays an installment, they earn a percentage based on their rank
3. **Team Bonus** — Upline members earn the differential between their rate and the max rate already paid
4. **Physical Rewards** — Cumulative rewards granted when both business volume and investment meet rank thresholds

### Real-Time Events (Socket.io)

| Event | Trigger | Purpose |
|-------|---------|---------|
| `investment:updated` | Investment created/approved | Refresh admin investment list |
| `user:updated` | User activated/blocked | Refresh admin activation tabs |
| `support:updated` | Ticket created/replied | Refresh support pages |
| `profit:updated` | Bonus distributed | Refresh user profit pages |

## API Routes Overview

| Prefix | Auth | Description |
|--------|------|-------------|
| `/api/auth` | None | Login, register |
| `/api/properties` | None | Public property listings |
| `/api/blog` | None | Public blog posts |
| `/api/inquiries` | None | Contact form |
| `/api/admin` | Admin only | All admin operations |
| `/api/user` | User auth | All user operations |

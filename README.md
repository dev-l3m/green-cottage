# Green Cottage - Booking Platform

A production-ready, modern Airbnb-like booking platform built with Next.js, TypeScript, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma
- **Authentication**: NextAuth.js
- **Payments**: Stripe Checkout
- **PDF Generation**: PDFKit
- **Calendar Sync**: iCal import/export

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (for local PostgreSQL)
- Stripe account (for payments)

### Local Development Setup

1. **Clone the repository**:
```bash
git clone <repository-url>
cd green-cottage
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Start PostgreSQL database** (using Docker Compose):
```bash
pnpm db:up
```

This starts a PostgreSQL 16 container on port 5432.

4. **Set up environment variables**:
```bash
cp apps/web/.env.example apps/web/.env
```

The `.env.example` file already includes the correct `DATABASE_URL` for local Docker setup:
```
DATABASE_URL="postgresql://green_cottage:green_cottage_dev@localhost:5432/green_cottage?schema=public"
```

**Important**: Generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

Add it to `apps/web/.env` along with your Stripe keys (get from https://dashboard.stripe.com/apikeys).

5. **Set up the database**:
```bash
# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data (admin user, sample cottages)
pnpm db:seed
```

6. **Start the development server**:
```bash
pnpm dev
```

The app will be available at http://localhost:3000

### Database Management

**Start/Stop Database**:
```bash
pnpm db:up      # Start PostgreSQL container
pnpm db:down    # Stop PostgreSQL container
```

**Prisma Studio** (Database GUI):
```bash
pnpm db:studio
```
Opens at http://localhost:5555

**Create a new migration**:
```bash
pnpm db:migrate
```

**View database**:
```bash
# Using psql (if installed)
psql postgresql://green_cottage:green_cottage_dev@localhost:5432/green_cottage
```

## Features

### V1 MVP (Implemented)

- ✅ Public marketing website
- ✅ Cottage listing and detail pages
- ✅ Booking engine with Stripe integration
- ✅ Customer dashboard
- ✅ Admin dashboard
- ✅ PDF invoice generation
- ✅ iCal import/export
- ✅ Review system
- ✅ GDPR pages

### V2/V3 (Scaffolded)

- Blog CMS + SEO
- Advanced cancellation policies
- Real-time chat
- Cleaning provider integration

## Development

### Available Scripts

**Development**:
```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Build for production
pnpm start            # Start production server
```

**Database**:
```bash
pnpm db:up            # Start PostgreSQL (Docker)
pnpm db:down          # Stop PostgreSQL (Docker)
pnpm db:generate      # Generate Prisma Client
pnpm db:migrate       # Run migrations (dev)
pnpm db:deploy        # Deploy migrations (prod)
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
```

**Prisma**:
```bash
pnpm prisma:migrate   # Alias for db:migrate
pnpm prisma:deploy    # Alias for db:deploy
pnpm seed             # Alias for db:seed
```

### Code Quality

- TypeScript strict mode enabled
- ESLint configured
- Prettier for formatting

## License

See LICENSE file.

## Support

For issues and questions, please contact the development team.

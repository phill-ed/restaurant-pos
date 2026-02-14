# 🍽️ Restaurant POS System

A complete point-of-sale system for restaurants built with Next.js 14 and PostgreSQL.

## Features

- 📊 **Dashboard** - Real-time sales overview and analytics
- 🍔 **Menu Management** - Categories, items, pricing, availability
- 🪑 **Table Management** - Visual table layout with status tracking
- 🛒 **Order System** - Cart, discounts, customer selection
- 👨‍🍳 **Kitchen Display** - Real-time order queue with status updates
- 💳 **Payments** - Cash, card processing
- 🧾 **Receipts** - Thermal printer support, digital receipts
- 📈 **Reports** - Sales analytics, best sellers
- 📦 **Inventory** - Stock tracking, low stock alerts
- 👥 **Staff** - Role-based access (admin, waiter, kitchen, cashier)
- 🏆 **Customer Loyalty** - Points system, visit tracking

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Database:** PostgreSQL (v14+)
- **State:** React Context + Local Storage

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

## Quick Start

### 1. Clone and Install

```bash
cd restaurant-pos
npm install
```

### 2. Setup PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Create database
createdb restaurant_pos

# Or using psql
psql -c "CREATE DATABASE restaurant_pos;"
```

**Option B: Docker**
```bash
docker run --name restaurant-pos-db \
  -e POSTGRES_DB=restaurant_pos \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14

# Set password if needed
docker exec -it restaurant-pos-db psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'password';"
```

**Option C: Cloud Provider**
- Use Supabase, Neon, Railway, or any PostgreSQL provider
- Copy your connection string

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your database URL
# DATABASE_URL=postgresql://user:password@localhost:5432/restaurant_pos
```

### 4. Initialize Database

```bash
# Run database migrations and seed data
npm run db:init
```

### 5. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000**

## Demo Login

| Role | PIN |
|------|-----|
| Admin | 1234 |
| Waiter | 1111 |
| Kitchen | 2222 |
| Cashier | 3333 |

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:init      # Initialize database & seed data
npm run db:seed      # Seed demo data only
```

## Database Schema

### Main Tables
- `users` - Staff accounts with roles
- `categories` - Menu categories
- `menu_items` - Menu items with pricing
- `tables` - Restaurant tables
- `customers` - Customer loyalty data
- `orders` - Order headers
- `order_items` - Order line items
- `inventory` - Stock management
- `receipts` - Receipt history

## Project Structure

```
restaurant-pos/
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── menu/         # Menu management
│   │   ├── orders/       # Order taking
│   │   ├── kitchen/      # Kitchen Display
│   │   ├── tables/       # Table management
│   │   ├── payments/     # Payment processing
│   │   ├── receipts/     # Receipt management
│   │   ├── reports/      # Sales reports
│   │   ├── inventory/    # Stock management
│   │   ├── staff/        # Staff management
│   │   └── customers/    # Customer loyalty
│   ├── components/       # Reusable components
│   ├── context/          # React Context providers
│   ├── lib/             # Utilities & database
│   └── types/           # TypeScript types
├── .env.example          # Environment template
├── package.json
└── README.md
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Railway, Render, Fly.io

1. Connect GitHub repository
2. Add PostgreSQL add-on
3. Set `DATABASE_URL` automatically
4. Deploy

## Kitchen Print Feature

Print kitchen tickets directly from the Kitchen Display:

1. Go to Kitchen page
2. Click printer icon on any order
3. Print preview opens
4. Print to thermal printer

**Thermal Printer Setup:**
- Use browser print dialog
- Set paper size to 58mm or 80mm
- Enable "Print headers and footers"

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/menu` | GET/POST | Menu items CRUD |
| `/api/tables` | GET/POST/PUT/DELETE | Tables CRUD |
| `/api/orders` | GET/POST/PUT | Orders CRUD |
| `/api/customers` | GET/POST/PUT/DELETE | Customers CRUD |
| `/api/inventory` | GET/POST/PUT/DELETE | Inventory CRUD |
| `/api/staff` | GET/POST/PUT/DELETE | Staff CRUD |
| `/api/reports` | GET | Sales reports |

## Support

- 📧 Create GitHub issue for bugs
- 💬 Discussions for questions

---

Built with ❤️ for restaurants everywhere

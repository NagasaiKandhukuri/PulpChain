# PulpChain

A sustainable B2B circular economy platform connecting schools (paper suppliers) and recycling industries (buyers) through a transparent, trackable logistics and payment system.

## Overview
PulpChain digitizes the recycling supply chain. Schools can register to sell their scrap paper, and recycling industries can purchase this raw material. The platform handles pickup logistics, digital inventory management, and B2B financial settlements, all overseen by administrators.

## Core Features

### Public Platform
- Homepage, About, Pricing, Contact, FAQ, Terms, Privacy
- Public Marketplace (viewing real-time inventory and rates)
- Registration and Authentication (OAuth, Email/Password)

### School Portal
- Registration and approval workflow
- Request scrap pickups
- View pickup history and status
- View payment history and receipts
- School Dashboard

### Industry Portal
- Registration and login
- Place orders for raw material
- Order history and tracking
- Industry Invoices and Payments tracking
- Contract and document management

### Admin Portal
- Comprehensive Administrator Dashboard
- School management (approve/reject/edit)
- Industry management (approve/reject/edit)
- Pickup logistics management
- Inventory tracking (Mixed Paper, Cardboard, White Paper)
- Order fulfillment and sales management
- Configurable base rates for materials
- Centralized purchase receipt and invoice generation

## User Roles
```text
Public User
    ↓
School (Supplier)
    ↓
Industry (Buyer)
    ↓
Administrator
```

## Technology Stack
- **Frontend Framework**: React 19, Vite 8, React Router DOM 7
- **Styling**: Vanilla CSS, Lucide React (Icons)
- **Backend / Auth / Database**: Supabase (PostgreSQL)
- **PDF Generation**: jsPDF, jsPDF AutoTable
- **QR Generation**: qrcode
- **Data Visualization**: Chart.js, react-chartjs-2

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for a complete system overview.

## Project Structure
```text
src/
├── components/   # Reusable UI components
├── contexts/     # React context providers (Auth, Theme)
├── lib/          # External service initialization (Supabase)
├── pages/        # Route components (admin, industry, school, public)
├── routes/       # Application routing logic
├── services/     # API/Database service layer
└── utils/        # Helper functions
```

## Local Development

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Linting & Building:
```bash
npm run lint
npm run build
```

## Environment Variables
The application requires the following environment variables (see `.env.example`):
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Database
PulpChain uses Supabase (PostgreSQL) for database management. The schema includes tables for `schools`, `industries`, `pickups`, `payments`, `inventory`, `inventory_transactions`, and `orders`. All database operations are secured using Row Level Security (RLS).

## Receipt Verification
The platform includes a centralized purchase receipt generator. Receipts are generated as PDFs using `jsPDF`. Each receipt contains a real verification QR code (generated via the `qrcode` package) that links directly to the `/verify/${receiptNo}` public route. Receipt data is securely derived from the application's pickup and payment database tables.

## Security
See [SECURITY.md](./SECURITY.md) for the security policy.

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guidelines.

## Project Status
**Production Deployment Preparation**. The MVP core functionality is fully implemented, linted, and built.

## License
See the LICENSE file for details.

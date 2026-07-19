# Architecture

## System Overview

```text
Public Web Application (React)
        ↓
Authentication (Supabase Auth)
        ↓
Role-Based Routing (React Router)
        ↓
Supabase Client (Supabase JS)
        ↓
PostgreSQL Database (Supabase)
```

## Frontend Architecture
- **Routing**: Client-side routing managed by `react-router-dom`, supporting public pages and role-protected routes.
- **Components**: Functional React components with hooks. Minimal external UI dependencies.
- **Contexts**: `AuthContext` provides global session and user role state. `ThemeContext` provides global theming.
- **State Management**: React local state (`useState`, `useEffect`) and context.
- **Service Layer**: Dedicated service files (`src/services/*.js`) abstract all Supabase database calls.
- **Utility Layer**: Formatting, calculation, and PDF generation utilities.

## Authentication Flow

```text
User
 ↓
Authentication (Login/Register via Email/OAuth)
 ↓
Session Establishment
 ↓
Profile / Role Resolution (Checks 'schools', 'industries', or 'admin' tables)
 ↓
Protected Route (ProtectedRoute.jsx)
 ↓
Role-Specific Portal (Admin, School, or Industry)
```

## Role-Based Access
- `school`: Access to `/school/*` routes. Verified against the `schools` table.
- `industry`: Access to `/industry/*` routes. Verified against the `industries` table.
- `admin`: Access to `/admin/*` routes. Verified via explicit application logic/flags.

## Data Flow
- **School Registration**: Public form -> Supabase Auth -> Insert into `schools` table with `status = 'pending'`.
- **Pickup Request**: School requests pickup -> Admin approves/weighs -> System logs `pickup` -> Generates `inventory_transaction` -> Updates `inventory`.
- **Payment Handling**: Admin processes payment for pickup -> Inserts `payments` record -> Updates pickup status.
- **Industry Order Flow**: Industry requests material -> Admin approves/ships -> Reduces `inventory` -> Generates invoice.

## Database Integration
The application interacts with Supabase PostgreSQL tables:
- `schools`
- `industries`
- `pickups`
- `payments`
- `inventory`
- `inventory_transactions`
- `orders`

## Receipt Generation
- **Source Service**: `src/services/purchaseReceiptGenerator.js`
- **PDF Generation**: Native generation via `jsPDF` and `jsPDF-AutoTable`.
- **QR Generation**: Uses `qrcode` to generate base64 Data URIs directly embedded in the PDF.
- **Verification**: URL constructed dynamically using `https://pulpchain.in/verify/${receiptNo}`.

## Security Boundaries
- **Authentication**: Managed exclusively by Supabase Auth.
- **Authorization**: Client-side routing barriers + Server-side Row Level Security (RLS) on all database tables.
- **Environment Variables**: Only the `anon` key is exposed to the client.

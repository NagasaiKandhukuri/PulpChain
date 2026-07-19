# Deployment Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase Project

## Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:
```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Build
Verify code quality and build the production bundle:
```bash
npm run lint
npm run build
```
The output will be placed in the `dist/` directory.

## Deployment
PulpChain is a Vite-based Single Page Application (SPA). The `dist/` folder can be deployed to any static hosting provider (e.g., Vercel, Netlify, AWS S3 + CloudFront).

*Note: The repository contains a `vercel.json` file for routing configuration if deploying to Vercel.*

## Supabase Requirements
- **Authentication Configuration**: Enable Email/Password authentication. Configure OAuth providers if required.
- **Database Schema**: The database schema must be initialized with the tables required by the application (schools, industries, pickups, etc.).
- **Row Level Security (RLS)**: Ensure all tables have strict RLS policies enabled to prevent unauthorized data access.

## Post-Deployment Smoke Test
Verify the following after deployment:
- Public homepage loads without errors.
- Admin login successfully authenticates and routes to `/admin/dashboard`.
- School registration flow successfully submits and creates a pending record.
- Industry registration flow successfully submits.
- Role-based routing redirects unauthorized users correctly.
- Purchase receipt generation successfully produces a PDF with a valid QR code.

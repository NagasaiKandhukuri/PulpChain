# PulpChain: Product & Engineering Summary

## Project Purpose & Problem Statement
The recycling supply chain is often informal, paper-based, and opaque. Schools generate large amounts of scrap paper but lack a streamlined way to sell it. Recycling industries require consistent raw material but struggle with fragmented supplier logistics.
PulpChain bridges this gap by providing a transparent, digitized B2B circular economy platform connecting scrap suppliers directly with recycling industries.

## Solution
PulpChain provides a unified SaaS platform offering:
- Verified supplier and buyer registration.
- Digital pickup requests and logistics tracking.
- Automated inventory management based on actual scale weights.
- Digital B2B marketplace for industries to purchase raw materials.
- Automated, verifiable purchase receipt and invoice generation.

## User Roles
1. **Public User**: Can view the marketplace and register.
2. **School (Supplier)**: Can request pickups and track payments.
3. **Industry (Buyer)**: Can view inventory, request material, and manage invoices.
4. **Administrator**: Oversees the entire supply chain, manages inventory, approves requests, and sets base rates.

## Major Workflows
1. **The Inbound Flow**: School requests pickup -> Admin collects material, records scale weight -> Inventory increases -> Admin processes payment -> Verifiable PDF receipt generated.
2. **The Outbound Flow**: Industry requests raw material -> Admin approves and ships -> Inventory decreases -> Invoice generated -> Payment tracked.

## Architecture & Technology Stack
- **Frontend**: React 19, Vite, React Router
- **UI/UX**: Custom CSS (No heavy UI frameworks), Lucide icons.
- **Backend/Database**: Supabase (PostgreSQL) with Row Level Security.
- **Specialized Integrations**: `jsPDF` + `qrcode` for generating cryptographically verifiable (via URL) purchase receipts purely on the client side.

## Key Engineering Decisions
- **Client-Side PDF Generation**: Offloaded document generation to the client browser using `jsPDF` to reduce backend infrastructure costs and serverless function timeouts.
- **No-Nonsense Tech Stack**: Avoided heavy frameworks (like Next.js) in favor of a lightweight Vite SPA, focusing strictly on high-performance B2B workflows.
- **Centralized Service Layer**: Abstracted all Supabase calls into `src/services/` to prevent database logic from bleeding into UI components.

## Current Limitations & Future Improvements
- **Payments**: Currently, payments are tracked manually by the admin. Future iterations could integrate payment gateways (e.g., Razorpay/Stripe).
- **Logistics**: Routing optimization for pickup vehicles is currently out-of-scope but planned for future phases.

# Supabase Realtime Design

PulpChain relies on realtime updates for operations, inventory, and finance. This document outlines the architecture for Phase 4 Realtime capabilities.

## 1. Inventory Channel
**Channel:** `inventory_updates`
- **Tables:** `inventory`
- **Events:** `UPDATE`
- **Payload:** `{ paper_type, quantity, updated_at }`
- **Frontend Listener:** Admin Inventory Dashboard. Automatically refreshes KPIs when stock moves.

## 2. Pickups Channel
**Channel:** `pickup_updates`
- **Tables:** `pickups`
- **Events:** `INSERT`, `UPDATE`
- **Payload:** `{ id, school_id, status, scheduled_date, actual_weight }`
- **Frontend Listener:** School Dashboard (tracks driver arrival), Admin Logistics Dashboard.

## 3. Payments Channel
**Channel:** `payment_updates`
- **Tables:** `payments`, `industry_payments`
- **Events:** `INSERT`, `UPDATE`
- **Payload:** `{ id, status, amount, payment_date }`
- **Frontend Listener:** School Payments Ledger, Admin Finance Dashboard. Updates balances instantly.

## 4. Industry Orders Channel
**Channel:** `industry_order_updates`
- **Tables:** `industry_orders`
- **Events:** `INSERT`, `UPDATE`
- **Payload:** `{ id, industry_id, status, quantity }`
- **Frontend Listener:** Industry Portal, Admin Marketplace. 

## 5. Notifications Channel
**Channel:** `user_notifications:{userId}`
- **Tables:** `notifications`
- **Events:** `INSERT`
- **Payload:** `{ id, title, message, created_at }`
- **Frontend Listener:** Global App Header. Shows unread badges instantly when new alerts are pushed.

## Security Considerations
Realtime channels will enforce RLS.
Schools only receive realtime pickups where `school_id = auth.uid()`.
Admins receive all payloads.

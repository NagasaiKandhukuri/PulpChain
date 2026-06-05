# Supabase Migration Verification Checklist

Use this checklist to ensure the production migration to Supabase has been executed flawlessly.

## Database Checks
- [ ] `profiles` table created, RLS enabled.
- [ ] Business tables created (`schools`, `industries`, `pickups`, `payments`, `industry_orders`, `industry_payments`, `rates`, `inventory`, `inventory_transactions`, `sales`, `documents`, `audit_logs`, `notifications`).
- [ ] Soft delete column `deleted_at` exists on major tables.
- [ ] `updated_at` column exists and triggers are functioning.
- [ ] Constraints enforced (e.g. `quantity >= 0`).
- [ ] Indexes created on common query fields (`school_id`, `status`, etc.).
- [ ] `handle_new_user` trigger successfully tested and defaults users to `school` to prevent admin escalation.
- [ ] RLS policies confirmed by testing unauthenticated/cross-tenant access.

## Auth Checks
- [ ] User can sign up (Email verification works if enabled).
- [ ] User can sign in and JWT tokens populate correctly.
- [ ] `profiles` row is automatically created upon signup via trigger.
- [ ] Password reset flow works.
- [ ] Logout invalidates the local session.

## Business Checks
### School Workflow
- [ ] School user can only see their own profile.
- [ ] School user can request a pickup.
- [ ] School user can view their pickup history and statuses.
- [ ] School user can view their payment history.

### Admin Workflow (Inventory & Logistics)
- [ ] Admin can view all pending pickups and update their status.
- [ ] Admin can record actual weights.
- [ ] Admin can log a payment to a school.
- [ ] Inventory dashboard correctly sums available quantities.
- [ ] Admin can update global rates.

### Industry Workflow
- [ ] Industry user can place an order.
- [ ] Industry user can only see their own order history.
- [ ] Admin can allocate inventory to industry orders.
- [ ] Invoices can be generated and uploaded to the `invoices` storage bucket securely.

### Document Storage
- [ ] Receipts upload to `receipts/userId/receiptId.pdf` successfully.
- [ ] Invoices upload to `invoices/userId/invoiceId.pdf` successfully.
- [ ] Users cannot access documents belonging to other users.

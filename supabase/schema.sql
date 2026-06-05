-- Phase 3 Supabase Migration Schema
-- Run this in the Supabase SQL Editor

-- 0. Setup update trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text check(role in ('admin','school','industry')),
  status text,
  created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. schools
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid primary key references public.profiles(id) on delete cascade,
  name text,
  address text,
  contact_person text,
  phone text,
  email text unique,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
DROP TRIGGER IF EXISTS update_schools_modtime ON public.schools;
CREATE TRIGGER update_schools_modtime BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 3. industries
CREATE TABLE IF NOT EXISTS public.industries (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text,
  contact_person text,
  email text unique,
  phone text,
  gst_number text,
  address text,
  industry_type text,
  monthly_requirement_kg numeric CHECK (monthly_requirement_kg >= 0),
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
DROP TRIGGER IF EXISTS update_industries_modtime ON public.industries;
CREATE TRIGGER update_industries_modtime BEFORE UPDATE ON public.industries FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 4. pickups
CREATE TABLE IF NOT EXISTS public.pickups (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  paper_type text,
  estimated_weight numeric CHECK (estimated_weight >= 0),
  actual_weight numeric CHECK (actual_weight >= 0),
  rate numeric CHECK (rate >= 0),
  amount numeric CHECK (amount >= 0),
  status text,
  request_date timestamptz default now(),
  scheduled_date timestamptz,
  completed_date timestamptz,
  paid_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_pickups_school_id ON public.pickups(school_id);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON public.pickups(status);
DROP TRIGGER IF EXISTS update_pickups_modtime ON public.pickups;
CREATE TRIGGER update_pickups_modtime BEFORE UPDATE ON public.pickups FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 5. payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid primary key default gen_random_uuid(),
  pickup_id uuid references public.pickups(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  amount numeric CHECK (amount >= 0),
  status text,
  payment_date timestamptz,
  transaction_reference text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_payments_school_id ON public.payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
DROP TRIGGER IF EXISTS update_payments_modtime ON public.payments;
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 6. inventory
CREATE TABLE IF NOT EXISTS public.inventory (
  paper_type text primary key,
  quantity numeric default 0 CHECK (quantity >= 0),
  updated_at timestamptz default now()
);
DROP TRIGGER IF EXISTS update_inventory_modtime ON public.inventory;
CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 7. inventory_transactions
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  paper_type text,
  quantity numeric CHECK (quantity >= 0),
  movement_type text,
  reference_id text,
  notes text,
  created_at timestamptz default now()
);

-- 8. industry_orders
CREATE TABLE IF NOT EXISTS public.industry_orders (
  id uuid primary key default gen_random_uuid(),
  industry_id uuid references public.industries(id) on delete cascade,
  paper_type text,
  quantity numeric CHECK (quantity >= 0),
  rate numeric CHECK (rate >= 0),
  amount numeric CHECK (amount >= 0),
  status text,
  required_delivery_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_industry_orders_industry_id ON public.industry_orders(industry_id);
CREATE INDEX IF NOT EXISTS idx_industry_orders_status ON public.industry_orders(status);
DROP TRIGGER IF EXISTS update_industry_orders_modtime ON public.industry_orders;
CREATE TRIGGER update_industry_orders_modtime BEFORE UPDATE ON public.industry_orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 9. industry_payments
CREATE TABLE IF NOT EXISTS public.industry_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.industry_orders(id) on delete cascade,
  industry_id uuid references public.industries(id) on delete cascade,
  amount numeric CHECK (amount >= 0),
  status text,
  payment_date timestamptz,
  transaction_reference text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_industry_payments_industry_id ON public.industry_payments(industry_id);
CREATE INDEX IF NOT EXISTS idx_industry_payments_status ON public.industry_payments(status);
DROP TRIGGER IF EXISTS update_industry_payments_modtime ON public.industry_payments;
CREATE TRIGGER update_industry_payments_modtime BEFORE UPDATE ON public.industry_payments FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 10. sales
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid primary key default gen_random_uuid(),
  invoice_number text,
  buyer_name text,
  paper_type text,
  quantity numeric CHECK (quantity >= 0),
  sale_rate numeric CHECK (sale_rate >= 0),
  total_revenue numeric CHECK (total_revenue >= 0),
  sale_date timestamptz default now()
);

-- 11. rates
CREATE TABLE IF NOT EXISTS public.rates (
  id uuid primary key default gen_random_uuid(),
  paper_type text unique,
  buy_rate numeric CHECK (buy_rate >= 0),
  sell_rate numeric CHECK (sell_rate >= 0),
  moq numeric CHECK (moq >= 0),
  updated_at timestamptz default now()
);
DROP TRIGGER IF EXISTS update_rates_modtime ON public.rates;
CREATE TRIGGER update_rates_modtime BEFORE UPDATE ON public.rates FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 12. documents
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid primary key default gen_random_uuid(),
  document_type text,
  reference_id text,
  owner_id uuid references public.profiles(id) on delete cascade,
  storage_path text,
  public_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON public.documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_reference_id ON public.documents(reference_id);
DROP TRIGGER IF EXISTS update_documents_modtime ON public.documents;
CREATE TRIGGER update_documents_modtime BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 13. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  action text,
  entity_type text,
  entity_id text,
  created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- 14. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  message text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text;
  assigned_role text;
BEGIN
  -- Security: Only allow safe roles. Default to school.
  -- Admin role CANNOT be assigned through user metadata.
  requested_role := new.raw_user_meta_data->>'role';
  
  IF requested_role IN ('school', 'industry') THEN
    assigned_role := requested_role;
  ELSE
    assigned_role := 'school';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    assigned_role,
    'pending'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Database Security Grants
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, UPDATE
ON public.profiles
TO authenticated;

GRANT SELECT, INSERT, UPDATE
ON public.schools
TO authenticated;

GRANT SELECT, INSERT, UPDATE
ON public.industries
TO authenticated;

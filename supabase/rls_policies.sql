-- Phase 3 Supabase Migration RLS Policies
-- Run this in the Supabase SQL Editor AFTER running schema.sql

-- Helper function to get current user role securely without recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
BEGIN
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
  RETURN _role;
END;
$$;

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.get_my_role() = 'admin');

-- SCHOOLS
DROP POLICY IF EXISTS "Users can view own school" ON public.schools;
CREATE POLICY "Users can view own school" ON public.schools FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own school" ON public.schools;
CREATE POLICY "Users can update own school" ON public.schools FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all schools" ON public.schools;
CREATE POLICY "Admins can view all schools" ON public.schools FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update all schools" ON public.schools;
CREATE POLICY "Admins can update all schools" ON public.schools FOR UPDATE USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert schools" ON public.schools;
CREATE POLICY "Admins can insert schools" ON public.schools FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Users can insert own school" ON public.schools;
CREATE POLICY "Users can insert own school" ON public.schools FOR INSERT WITH CHECK (auth.uid() = id);

-- INDUSTRIES
DROP POLICY IF EXISTS "Users can view own industry" ON public.industries;
CREATE POLICY "Users can view own industry" ON public.industries FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own industry" ON public.industries;
CREATE POLICY "Users can update own industry" ON public.industries FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all industries" ON public.industries;
CREATE POLICY "Admins can view all industries" ON public.industries FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update all industries" ON public.industries;
CREATE POLICY "Admins can update all industries" ON public.industries FOR UPDATE USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert industries" ON public.industries;
CREATE POLICY "Admins can insert industries" ON public.industries FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Users can insert own industry" ON public.industries;
CREATE POLICY "Users can insert own industry" ON public.industries FOR INSERT WITH CHECK (auth.uid() = id);

-- PICKUPS
DROP POLICY IF EXISTS "Schools view own pickups" ON public.pickups;
CREATE POLICY "Schools view own pickups" ON public.pickups FOR SELECT USING (school_id = auth.uid());

DROP POLICY IF EXISTS "Schools insert own pickups" ON public.pickups;
CREATE POLICY "Schools insert own pickups" ON public.pickups FOR INSERT WITH CHECK (school_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all pickups" ON public.pickups;
CREATE POLICY "Admins can view all pickups" ON public.pickups FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update all pickups" ON public.pickups;
CREATE POLICY "Admins can update all pickups" ON public.pickups FOR UPDATE USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert pickups" ON public.pickups;
CREATE POLICY "Admins can insert pickups" ON public.pickups FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

-- PAYMENTS
DROP POLICY IF EXISTS "Schools view own payments" ON public.payments;
CREATE POLICY "Schools view own payments" ON public.payments FOR SELECT USING (school_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all payments" ON public.payments;
CREATE POLICY "Admins view all payments" ON public.payments FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins update all payments" ON public.payments;
CREATE POLICY "Admins update all payments" ON public.payments FOR UPDATE USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins insert payments" ON public.payments;
CREATE POLICY "Admins insert payments" ON public.payments FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

-- INVENTORY & INVENTORY TRANSACTIONS
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.inventory;
CREATE POLICY "Anyone can view inventory" ON public.inventory FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins update inventory" ON public.inventory;
CREATE POLICY "Admins update inventory" ON public.inventory FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins view inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Admins view inventory transactions" ON public.inventory_transactions FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins insert inventory transactions" ON public.inventory_transactions;
CREATE POLICY "Admins insert inventory transactions" ON public.inventory_transactions FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

-- INDUSTRY ORDERS
DROP POLICY IF EXISTS "Industries view own orders" ON public.industry_orders;
CREATE POLICY "Industries view own orders" ON public.industry_orders FOR SELECT USING (industry_id = auth.uid());

DROP POLICY IF EXISTS "Industries insert own orders" ON public.industry_orders;
CREATE POLICY "Industries insert own orders" ON public.industry_orders FOR INSERT WITH CHECK (industry_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all orders" ON public.industry_orders;
CREATE POLICY "Admins view all orders" ON public.industry_orders FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins update all orders" ON public.industry_orders;
CREATE POLICY "Admins update all orders" ON public.industry_orders FOR UPDATE USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins insert orders" ON public.industry_orders;
CREATE POLICY "Admins insert orders" ON public.industry_orders FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

-- INDUSTRY PAYMENTS
DROP POLICY IF EXISTS "Industries view own payments" ON public.industry_payments;
CREATE POLICY "Industries view own payments" ON public.industry_payments FOR SELECT USING (industry_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all industry payments" ON public.industry_payments;
CREATE POLICY "Admins view all industry payments" ON public.industry_payments FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins update all industry payments" ON public.industry_payments;
CREATE POLICY "Admins update all industry payments" ON public.industry_payments FOR UPDATE USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins insert industry payments" ON public.industry_payments;
CREATE POLICY "Admins insert industry payments" ON public.industry_payments FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

-- SALES
DROP POLICY IF EXISTS "Admins full access sales" ON public.sales;
CREATE POLICY "Admins full access sales" ON public.sales FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

-- RATES
DROP POLICY IF EXISTS "Anyone can view rates" ON public.rates;
CREATE POLICY "Anyone can view rates" ON public.rates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins update rates" ON public.rates;
CREATE POLICY "Admins update rates" ON public.rates FOR ALL USING (public.get_my_role() = 'admin') WITH CHECK (public.get_my_role() = 'admin');

-- DOCUMENTS
DROP POLICY IF EXISTS "Users view own docs" ON public.documents;
CREATE POLICY "Users view own docs" ON public.documents FOR SELECT USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own docs" ON public.documents;
CREATE POLICY "Users insert own docs" ON public.documents FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Admins view all docs" ON public.documents;
CREATE POLICY "Admins view all docs" ON public.documents FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins insert all docs" ON public.documents;
CREATE POLICY "Admins insert all docs" ON public.documents FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins update all docs" ON public.documents;
CREATE POLICY "Admins update all docs" ON public.documents FOR UPDATE USING (public.get_my_role() = 'admin');

-- AUDIT LOGS
DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins insert audit logs" ON public.audit_logs;
CREATE POLICY "Admins insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins insert notifications" ON public.notifications;
CREATE POLICY "Admins insert notifications" ON public.notifications FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

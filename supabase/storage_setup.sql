-- Phase 3 Supabase Migration Storage Setup
-- Run this in the Supabase SQL Editor

-- NOTE: Create the buckets 'receipts' and 'invoices' manually in the Supabase Dashboard UI.
-- DO NOT alter storage.objects or storage.buckets directly.

-- Storage Policies for 'receipts'
DROP POLICY IF EXISTS "Users can upload their receipts" ON storage.objects;
CREATE POLICY "Users can upload their receipts" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view their receipts" ON storage.objects;
CREATE POLICY "Users can view their receipts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all receipts" ON storage.objects;
CREATE POLICY "Admins can view all receipts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'receipts' AND public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert all receipts" ON storage.objects;
CREATE POLICY "Admins can insert all receipts" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'receipts' AND public.get_my_role() = 'admin');


-- Storage Policies for 'invoices'
DROP POLICY IF EXISTS "Users can upload their invoices" ON storage.objects;
CREATE POLICY "Users can upload their invoices" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'invoices' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can view their invoices" ON storage.objects;
CREATE POLICY "Users can view their invoices" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'invoices' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can view all invoices" ON storage.objects;
CREATE POLICY "Admins can view all invoices" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'invoices' AND public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert all invoices" ON storage.objects;
CREATE POLICY "Admins can insert all invoices" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'invoices' AND public.get_my_role() = 'admin');

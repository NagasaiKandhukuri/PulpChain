-- 1. Ensure PUBLIC schema has proper usage
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Ensure all tables have proper grants
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 3. Safely drop and recreate get_my_role with a foolproof anti-recursion guard
DROP FUNCTION IF EXISTS public.get_my_role();

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
  _is_fetching boolean;
BEGIN
  -- Check if we are already fetching the role to prevent infinite recursion
  BEGIN
    _is_fetching := current_setting('app.is_fetching_role', true) = 'true';
  EXCEPTION WHEN OTHERS THEN
    _is_fetching := false;
  END;

  IF _is_fetching THEN
    RETURN NULL;
  END IF;

  -- Set flag
  PERFORM set_config('app.is_fetching_role', 'true', true);

  -- Fetch role (runs as postgres, bypassing RLS)
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();

  -- Unset flag
  PERFORM set_config('app.is_fetching_role', 'false', true);

  RETURN _role;
EXCEPTION WHEN OTHERS THEN
  -- Always unset flag on error
  PERFORM set_config('app.is_fetching_role', 'false', true);
  RETURN NULL;
END;
$$;

-- 4. Re-apply the profiles policy just to be absolutely sure
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.get_my_role() = 'admin');


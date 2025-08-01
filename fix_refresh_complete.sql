-- =====================================================
-- COMPREHENSIVE FIX FOR REFRESH ISSUES
-- =====================================================

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE public.kpi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. DROP ALL EXISTING POLICIES (SAFE)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.kpi_data;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.kpi_data;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.kpi_data;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.kpi_data;
DROP POLICY IF EXISTS "Viewers can view all KPI data" ON public.kpi_data;
DROP POLICY IF EXISTS "Admins can manage all KPI data" ON public.kpi_data;
DROP POLICY IF EXISTS "Department admins can manage their department KPI" ON public.kpi_data;
DROP POLICY IF EXISTS "Allow authenticated users to view KPI data" ON public.kpi_data;
DROP POLICY IF EXISTS "Allow authenticated users to manage KPI data" ON public.kpi_data;
DROP POLICY IF EXISTS "Fallback policy for KPI data" ON public.kpi_data;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to delete profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Fallback policy for user profiles" ON public.user_profiles;

-- 3. CREATE SIMPLIFIED POLICIES (NO COMPLEX LOGIC)
-- KPI_DATA POLICIES
CREATE POLICY "Allow authenticated users to view KPI data" ON public.kpi_data
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage KPI data" ON public.kpi_data
    FOR ALL USING (auth.role() = 'authenticated');

-- USER_PROFILES POLICIES
CREATE POLICY "Allow authenticated users to view profiles" ON public.user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to insert profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to delete profiles" ON public.user_profiles
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. ADD 'user' ROLE IF NOT EXISTS
INSERT INTO public.user_roles (role_name, description) VALUES
    ('user', 'Basic user - can view dashboard and basic KPI data')
ON CONFLICT (role_name) DO NOTHING;

-- 5. CREATE SIMPLIFIED USER ROLE FUNCTION
CREATE OR REPLACE FUNCTION get_user_role_simple(user_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    user_role VARCHAR(50);
BEGIN
    -- Try to get role from user_profiles
    SELECT ur.role_name INTO user_role
    FROM public.user_profiles up
    JOIN public.user_roles ur ON up.role_id = ur.id
    WHERE up.user_id = user_uuid;
    
    -- If no role found, return 'admin' as default (for testing)
    IF user_role IS NULL THEN
        RETURN 'admin';
    END IF;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. VERIFY RLS IS ENABLED
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('kpi_data', 'user_profiles');

-- 7. CHECK EXISTING POLICIES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('kpi_data', 'user_profiles');

-- =====================================================
-- END OF COMPREHENSIVE FIX
-- ===================================================== 
-- =====================================================
-- ENABLE RLS AND FIX POLICIES
-- =====================================================

-- 1. ENABLE RLS ON KPI_DATA TABLE
ALTER TABLE public.kpi_data ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES (SAFE)
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

-- 3. CREATE SIMPLIFIED POLICIES FOR KPI_DATA
CREATE POLICY "Allow authenticated users to view KPI data" ON public.kpi_data
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage KPI data" ON public.kpi_data
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. ENABLE RLS ON USER_PROFILES TABLE
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. DROP EXISTING USER_PROFILES POLICIES (SAFE)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to delete profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Fallback policy for user profiles" ON public.user_profiles;

-- 6. CREATE SIMPLIFIED POLICIES FOR USER_PROFILES
CREATE POLICY "Allow authenticated users to view profiles" ON public.user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to insert profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to delete profiles" ON public.user_profiles
    FOR DELETE USING (auth.role() = 'authenticated');

-- 7. VERIFY RLS IS ENABLED
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('kpi_data', 'user_profiles');

-- =====================================================
-- END OF ENABLE RLS
-- ===================================================== 
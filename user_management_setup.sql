-- =====================================================
-- USER MANAGEMENT SETUP FOR KPI SYSTEM (SAFE VERSION)
-- =====================================================

-- 1. CREATE USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSERT DEFAULT ROLES
INSERT INTO public.user_roles (role_name, description) VALUES
    ('admin', 'Full access - can create, edit, delete KPI for all departments'),
    ('admin_bahagian', 'Department admin - can manage KPI for assigned department only'),
    ('viewer', 'View only - can view dashboard and KPI data only'),
    ('user', 'Basic user - can view dashboard and basic KPI data')
ON CONFLICT (role_name) DO NOTHING;

-- 3. CREATE USER PROFILES TABLE (EXTENDED)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES public.user_roles(id) NOT NULL,
    department_id INTEGER REFERENCES public.departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE FUNCTION TO UPDATE UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. DROP EXISTING TRIGGERS FIRST (SAFE)
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

-- 6. CREATE TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON public.user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. DROP EXISTING POLICIES FIRST (SAFE)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admins to delete profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Fallback policy for user profiles" ON public.user_profiles;

-- 8. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies (NO RECURSION)
CREATE POLICY "Allow authenticated users to view profiles" ON public.user_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow admins to insert profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to delete profiles" ON public.user_profiles
    FOR DELETE USING (auth.role() = 'authenticated');

-- 9. CREATE FUNCTION TO GET USER ROLE
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    user_role VARCHAR(50);
BEGIN
    SELECT ur.role_name INTO user_role
    FROM public.user_profiles up
    JOIN public.user_roles ur ON up.role_id = ur.id
    WHERE up.user_id = user_uuid;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. CREATE SIMPLIFIED USER ROLE FUNCTION
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
    
    -- If no role found, return 'user' as default
    IF user_role IS NULL THEN
        RETURN 'user';
    END IF;
    
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CREATE FUNCTION TO CHECK USER PERMISSIONS
CREATE OR REPLACE FUNCTION can_manage_kpi(kpi_department_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_role VARCHAR(50);
    current_user_department_id INTEGER;
BEGIN
    -- Get current user's role
    SELECT get_user_role(auth.uid()) INTO current_user_role;
    
    -- If admin, can manage all KPIs
    IF current_user_role = 'admin' THEN
        RETURN true;
    END IF;
    
    -- If admin_bahagian, can only manage their department's KPIs
    IF current_user_role = 'admin_bahagian' THEN
        SELECT department_id INTO current_user_department_id
        FROM public.user_profiles
        WHERE user_id = auth.uid();
        
        RETURN current_user_department_id = kpi_department_id;
    END IF;
    
    -- If viewer, cannot manage any KPIs
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. DROP EXISTING KPI POLICIES FIRST (SAFE)
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

-- 13. CREATE SIMPLIFIED KPI POLICIES
CREATE POLICY "Allow authenticated users to view KPI data" ON public.kpi_data
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage KPI data" ON public.kpi_data
    FOR ALL USING (auth.role() = 'authenticated');

-- 14. CREATE FUNCTION TO REGISTER NEW USER
CREATE OR REPLACE FUNCTION register_user(
    user_email VARCHAR(255),
    user_full_name VARCHAR(255),
    user_role_name VARCHAR(50),
    user_department_id INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    role_id_val INTEGER;
BEGIN
    -- Get role ID
    SELECT id INTO role_id_val
    FROM public.user_roles
    WHERE role_name = user_role_name;
    
    IF role_id_val IS NULL THEN
        RAISE EXCEPTION 'Invalid role: %', user_role_name;
    END IF;
    
    -- Create user profile
    INSERT INTO public.user_profiles (
        email, 
        full_name, 
        role_id, 
        department_id
    ) VALUES (
        user_email,
        user_full_name,
        role_id_val,
        user_department_id
    ) RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. CREATE VIEW FOR USER LIST (ADMIN ONLY)
CREATE OR REPLACE VIEW public.user_list AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    ur.role_name,
    d.name as department_name,
    up.is_active,
    up.created_at
FROM public.user_profiles up
JOIN public.user_roles ur ON up.role_id = ur.id
LEFT JOIN public.departments d ON up.department_id = d.id;

-- Grant permissions
GRANT SELECT ON public.user_list TO authenticated;

-- =====================================================
-- END OF USER MANAGEMENT SETUP (SAFE VERSION)
-- ===================================================== 
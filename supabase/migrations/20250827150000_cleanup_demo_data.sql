-- Cleanup Demo Data Migration
-- This migration removes all demo/sample data from the database
-- Run this to clean up demo users, teams, and related data

-- 1. CLEANUP DEMO DATA
DO $$
DECLARE
    demo_user_ids UUID[];
    demo_team_ids UUID[];
    demo_event_ids UUID[];
BEGIN
    -- Get demo user IDs (users with demo email domains)
    SELECT ARRAY_AGG(id) INTO demo_user_ids
    FROM auth.users
    WHERE email LIKE '%@hackfest.edu' 
       OR email LIKE '%@university.edu'
       OR email LIKE '%@example.com'
       OR email LIKE '%demo%'
       OR email LIKE '%test%'
       OR email LIKE '%sample%';

    -- Get demo team IDs (teams led by demo users or with demo names)
    SELECT ARRAY_AGG(id) INTO demo_team_ids
    FROM public.teams
    WHERE leader_id = ANY(demo_user_ids)
       OR name ILIKE '%demo%'
       OR name ILIKE '%test%'
       OR name ILIKE '%sample%'
       OR name = 'Code Warriors';

    -- Get demo event IDs (events created by demo users or with demo names)
    SELECT ARRAY_AGG(id) INTO demo_event_ids
    FROM public.events
    WHERE created_by = ANY(demo_user_ids)
       OR name ILIKE '%demo%'
       OR name ILIKE '%test%'
       OR name ILIKE '%sample%';

    -- Delete in dependency order to avoid foreign key constraints
    
    -- 1. Delete bookmarked updates
    DELETE FROM public.bookmarked_updates 
    WHERE user_id = ANY(demo_user_ids);
    
    -- 2. Delete notifications
    DELETE FROM public.notifications 
    WHERE user_id = ANY(demo_user_ids);
    
    -- 3. Delete submissions
    DELETE FROM public.submissions 
    WHERE team_id = ANY(demo_team_ids);
    
    -- 4. Delete payments
    DELETE FROM public.payments 
    WHERE user_id = ANY(demo_user_ids) 
       OR team_id = ANY(demo_team_ids);
    
    -- 5. Delete team members
    DELETE FROM public.team_members 
    WHERE user_id = ANY(demo_user_ids) 
       OR team_id = ANY(demo_team_ids);
    
    -- 6. Delete teams
    DELETE FROM public.teams 
    WHERE id = ANY(demo_team_ids) 
       OR leader_id = ANY(demo_user_ids);
    
    -- 7. Delete event updates
    DELETE FROM public.event_updates 
    WHERE author_id = ANY(demo_user_ids) 
       OR event_id = ANY(demo_event_ids);
    
    -- 8. Delete problem statements
    DELETE FROM public.problem_statements 
    WHERE event_id = ANY(demo_event_ids);
    
    -- 9. Delete events
    DELETE FROM public.events 
    WHERE id = ANY(demo_event_ids) 
       OR created_by = ANY(demo_user_ids);
    
    -- 10. Delete user profiles
    DELETE FROM public.user_profiles 
    WHERE id = ANY(demo_user_ids);
    
    -- 11. Delete auth users (this will cascade to related data)
    DELETE FROM auth.users 
    WHERE id = ANY(demo_user_ids);
    
    -- Log cleanup results
    RAISE NOTICE 'Demo data cleanup completed successfully';
    RAISE NOTICE 'Cleaned up % demo users', array_length(demo_user_ids, 1);
    RAISE NOTICE 'Cleaned up % demo teams', array_length(demo_team_ids, 1);
    RAISE NOTICE 'Cleaned up % demo events', array_length(demo_event_ids, 1);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Demo data cleanup failed: %', SQLERRM;
        -- Don't re-raise the exception to allow migration to continue
END $$;

-- 2. UPDATE RLS POLICIES TO ENSURE DATA ISOLATION
-- Make sure users can only see their own data

-- Update user_profiles RLS policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Update teams RLS policies
DROP POLICY IF EXISTS "Users can view teams they are members of" ON public.teams;
CREATE POLICY "Users can view teams they are members of" ON public.teams
    FOR SELECT USING (
        auth.uid() = leader_id OR 
        auth.uid() IN (
            SELECT user_id FROM public.team_members WHERE team_id = teams.id
        )
    );

DROP POLICY IF EXISTS "Team leaders can update their teams" ON public.teams;
CREATE POLICY "Team leaders can update their teams" ON public.teams
    FOR UPDATE USING (auth.uid() = leader_id);

-- Update team_members RLS policies
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
CREATE POLICY "Users can view team members of their teams" ON public.team_members
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT leader_id FROM public.teams WHERE id = team_members.team_id
        )
    );

-- Update payments RLS policies
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Update notifications RLS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- 3. CREATE HELPER FUNCTION TO CHECK FOR DEMO DATA
CREATE OR REPLACE FUNCTION public.has_demo_data()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    demo_count INTEGER := 0;
BEGIN
    -- Count remaining demo users
    SELECT COUNT(*) INTO demo_count
    FROM auth.users
    WHERE email LIKE '%@hackfest.edu' 
       OR email LIKE '%@university.edu'
       OR email LIKE '%demo%'
       OR email LIKE '%test%'
       OR email LIKE '%sample%';
    
    RETURN demo_count > 0;
END;
$$;

-- Log final status
DO $$
BEGIN
    IF public.has_demo_data() THEN
        RAISE NOTICE 'WARNING: Some demo data may still exist in the database';
    ELSE
        RAISE NOTICE 'SUCCESS: All demo data has been cleaned up';
    END IF;
END $$;

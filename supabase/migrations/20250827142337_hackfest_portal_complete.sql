-- Location: supabase/migrations/20250827142337_hackfest_portal_complete.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: Complete HackFest Portal Implementation
-- Dependencies: None - fresh implementation

-- 1. TYPES AND ENUMS
CREATE TYPE public.user_role AS ENUM ('participant', 'admin', 'mentor', 'judge');
CREATE TYPE public.team_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE public.notification_type AS ENUM ('registration', 'payment', 'event_update', 'general');
CREATE TYPE public.submission_status AS ENUM ('not_submitted', 'submitted', 'under_review', 'evaluated');

-- 2. CORE USER MANAGEMENT
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'participant'::public.user_role,
    university TEXT,
    student_id TEXT,
    phone_number TEXT,
    profile_picture_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    bio TEXT,
    skills TEXT[],
    github_url TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. EVENT MANAGEMENT
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    registration_start TIMESTAMPTZ NOT NULL,
    registration_end TIMESTAMPTZ NOT NULL,
    max_participants INTEGER DEFAULT 500,
    registration_fee DECIMAL(10,2) DEFAULT 0,
    status public.event_status DEFAULT 'upcoming'::public.event_status,
    venue TEXT,
    rules TEXT,
    prizes JSONB,
    sponsors JSONB,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. PROBLEM STATEMENTS
CREATE TABLE public.problem_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty_level TEXT DEFAULT 'Medium',
    category TEXT,
    requirements TEXT,
    resources TEXT,
    max_team_size INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. TEAM MANAGEMENT
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    problem_statement_id UUID REFERENCES public.problem_statements(id) ON DELETE SET NULL,
    leader_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status public.team_status DEFAULT 'draft'::public.team_status,
    max_members INTEGER DEFAULT 4,
    invite_code TEXT UNIQUE,
    github_repo TEXT,
    project_description TEXT,
    tech_stack TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. TEAM MEMBERS
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- 7. PAYMENTS
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    stripe_payment_intent_id TEXT,
    payment_method TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. SUBMISSIONS
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    demo_url TEXT,
    github_repo TEXT,
    presentation_url TEXT,
    video_url TEXT,
    status public.submission_status DEFAULT 'not_submitted'::public.submission_status,
    submitted_at TIMESTAMPTZ,
    score DECIMAL(5,2),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. EVENT UPDATES
CREATE TABLE public.event_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type public.notification_type DEFAULT 'general'::public.notification_type,
    is_important BOOLEAN DEFAULT false,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. NOTIFICATIONS
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type public.notification_type DEFAULT 'general'::public.notification_type,
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. BOOKMARKED UPDATES
CREATE TABLE public.bookmarked_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    update_id UUID REFERENCES public.event_updates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, update_id)
);

-- 12. ESSENTIAL INDEXES
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_registration_dates ON public.events(registration_start, registration_end);
CREATE INDEX idx_teams_event_id ON public.teams(event_id);
CREATE INDEX idx_teams_leader_id ON public.teams(leader_id);
CREATE INDEX idx_teams_status ON public.teams(status);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_submissions_team_id ON public.submissions(team_id);
CREATE INDEX idx_submissions_event_id ON public.submissions(event_id);
CREATE INDEX idx_event_updates_event_id ON public.event_updates(event_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- 13. UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $func$
DECLARE
    code TEXT;
BEGIN
    code := upper(substr(md5(random()::text), 1, 6));
    RETURN code;
END;
$func$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $func$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'participant'::public.user_role)
    );
    RETURN NEW;
END;
$func$;

-- 14. TRIGGERS
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. RLS SETUP
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarked_updates ENABLE ROW LEVEL SECURITY;

-- 16. RLS POLICIES

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 4: Public read, private write for events
CREATE POLICY "public_can_read_events"
ON public.events
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_events"
ON public.events
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- Pattern 4: Public read for problem statements
CREATE POLICY "public_can_read_problem_statements"
ON public.problem_statements
FOR SELECT
TO public
USING (true);

CREATE POLICY "admin_manage_problem_statements"
ON public.problem_statements
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- Pattern 2: Simple user ownership for teams
CREATE POLICY "users_manage_own_teams"
ON public.teams
FOR ALL
TO authenticated
USING (leader_id = auth.uid())
WITH CHECK (leader_id = auth.uid());

-- Team members can read their teams
CREATE POLICY "team_members_can_read_teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = id AND tm.user_id = auth.uid()
    )
);

-- Pattern 2: Team members ownership
CREATE POLICY "users_manage_team_members"
ON public.team_members
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.teams t
        WHERE t.id = team_id AND t.leader_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.teams t
        WHERE t.id = team_id AND t.leader_id = auth.uid()
    )
);

-- Team members can read themselves
CREATE POLICY "members_can_read_themselves"
ON public.team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Pattern 2: Simple user ownership for payments
CREATE POLICY "users_manage_own_payments"
ON public.payments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can view all payments
CREATE POLICY "admin_view_all_payments"
ON public.payments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- Team submissions - team members can access
CREATE POLICY "team_members_manage_submissions"
ON public.submissions
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
);

-- Public can read published event updates
CREATE POLICY "public_can_read_event_updates"
ON public.event_updates
FOR SELECT
TO public
USING (true);

-- Admin can manage event updates
CREATE POLICY "admin_manage_event_updates"
ON public.event_updates
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- Pattern 2: Simple user ownership for notifications
CREATE POLICY "users_manage_own_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple user ownership for bookmarked updates
CREATE POLICY "users_manage_own_bookmarked_updates"
ON public.bookmarked_updates
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 17. MOCK DATA FOR DEVELOPMENT
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    participant1_uuid UUID := gen_random_uuid();
    participant2_uuid UUID := gen_random_uuid();
    mentor_uuid UUID := gen_random_uuid();
    event1_uuid UUID := gen_random_uuid();
    team1_uuid UUID := gen_random_uuid();
    problem1_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@hackfest.edu', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (participant1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'arjun@university.edu', crypt('participant123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Arjun Sharma", "role": "participant"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (participant2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'priya@university.edu', crypt('participant123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Priya Patel", "role": "participant"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (mentor_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'mentor@hackfest.edu', crypt('mentor123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Dr. Sarah Wilson", "role": "mentor"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Wait for triggers to create user profiles
    PERFORM pg_sleep(0.1);
    
    -- Update user profiles with additional data
    UPDATE public.user_profiles SET 
        university = 'Tech University',
        student_id = 'TU2024001',
        phone_number = '+91 9876543210',
        is_verified = true,
        skills = ARRAY['JavaScript', 'React', 'Node.js']
    WHERE id = participant1_uuid;

    UPDATE public.user_profiles SET 
        university = 'Tech University',
        student_id = 'TU2024002',
        phone_number = '+91 9876543211',
        is_verified = true,
        skills = ARRAY['Python', 'Django', 'Machine Learning']
    WHERE id = participant2_uuid;

    -- Create HackFest 2024 event
    INSERT INTO public.events (id, name, description, start_date, end_date, registration_start, registration_end, max_participants, registration_fee, venue, created_by, prizes, sponsors)
    VALUES (
        event1_uuid,
        'HackFest 2024',
        'The ultimate hackathon experience. Build innovative solutions, collaborate with brilliant minds, and compete for amazing prizes.',
        '2024-12-20 09:00:00+00'::timestamptz,
        '2024-12-22 18:00:00+00'::timestamptz,
        '2024-12-01 00:00:00+00'::timestamptz,
        '2024-12-15 23:59:59+00'::timestamptz,
        500,
        999.00,
        'Tech University Campus',
        admin_uuid,
        '[{"position": "1st", "prize": "₹50,000", "description": "Winner"}, {"position": "2nd", "prize": "₹30,000", "description": "First Runner Up"}, {"position": "3rd", "prize": "₹20,000", "description": "Second Runner Up"}]'::jsonb,
        '[{"name": "Tech Corp", "logo": "/logos/techcorp.png", "tier": "Platinum"}, {"name": "Innovation Labs", "logo": "/logos/innovation.png", "tier": "Gold"}]'::jsonb
    );

    -- Create problem statements
    INSERT INTO public.problem_statements (id, event_id, title, description, category, max_team_size)
    VALUES 
        (problem1_uuid, event1_uuid, 'Smart City Solutions', 'Develop innovative solutions to make cities smarter and more sustainable using IoT, AI, and data analytics.', 'Smart City', 4),
        (gen_random_uuid(), event1_uuid, 'Healthcare Innovation', 'Create digital health solutions that improve patient care and healthcare accessibility.', 'Healthcare', 4),
        (gen_random_uuid(), event1_uuid, 'EdTech Revolution', 'Build educational technology solutions that enhance learning experiences.', 'Education', 4),
        (gen_random_uuid(), event1_uuid, 'FinTech Solutions', 'Develop financial technology solutions for better financial inclusion and management.', 'Finance', 4);

    -- Create a sample team
    INSERT INTO public.teams (id, name, description, event_id, problem_statement_id, leader_id, invite_code, status)
    VALUES (
        team1_uuid,
        'Code Warriors',
        'A passionate team focused on creating innovative smart city solutions.',
        event1_uuid,
        problem1_uuid,
        participant1_uuid,
        public.generate_invite_code(),
        'submitted'::public.team_status
    );

    -- Add team members
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES 
        (team1_uuid, participant1_uuid, 'leader'),
        (team1_uuid, participant2_uuid, 'member');

    -- Create event updates
    INSERT INTO public.event_updates (event_id, title, content, type, is_important, author_id)
    VALUES 
        (event1_uuid, 'Registration Now Open!', 'Registration for HackFest 2024 is now open. Secure your spot today!', 'registration'::public.notification_type, true, admin_uuid),
        (event1_uuid, 'Mentorship Sessions Announced', 'We have scheduled mentorship sessions with industry experts throughout the hackathon.', 'event_update'::public.notification_type, false, admin_uuid),
        (event1_uuid, 'Venue Details Updated', 'The hackathon will be held at the new Tech University Innovation Center. Check the location details in your dashboard.', 'event_update'::public.notification_type, true, admin_uuid);

    -- Create sample notifications
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES 
        (participant1_uuid, 'Team Registration Successful', 'Your team "Code Warriors" has been successfully registered for HackFest 2024.', 'registration'::public.notification_type),
        (participant1_uuid, 'Payment Confirmation', 'Your registration fee payment has been confirmed. Welcome to HackFest 2024!', 'payment'::public.notification_type),
        (participant2_uuid, 'Team Invitation', 'You have been invited to join team "Code Warriors" for HackFest 2024.', 'registration'::public.notification_type);

    -- Create sample payment
    INSERT INTO public.payments (user_id, team_id, event_id, amount, status, paid_at)
    VALUES 
        (participant1_uuid, team1_uuid, event1_uuid, 999.00, 'paid'::public.payment_status, now());

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data creation failed: %', SQLERRM;
END $$;

-- 18. CLEANUP FUNCTION FOR DEVELOPMENT
CREATE OR REPLACE FUNCTION public.cleanup_hackfest_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $cleanup$
DECLARE
    test_user_ids UUID[];
BEGIN
    -- Get test user IDs
    SELECT ARRAY_AGG(id) INTO test_user_ids
    FROM auth.users
    WHERE email LIKE '%@hackfest.edu' OR email LIKE '%@university.edu';

    -- Delete in dependency order
    DELETE FROM public.bookmarked_updates WHERE user_id = ANY(test_user_ids);
    DELETE FROM public.notifications WHERE user_id = ANY(test_user_ids);
    DELETE FROM public.submissions WHERE team_id IN (SELECT id FROM public.teams WHERE leader_id = ANY(test_user_ids));
    DELETE FROM public.payments WHERE user_id = ANY(test_user_ids);
    DELETE FROM public.team_members WHERE user_id = ANY(test_user_ids);
    DELETE FROM public.teams WHERE leader_id = ANY(test_user_ids);
    DELETE FROM public.event_updates WHERE author_id = ANY(test_user_ids);
    DELETE FROM public.problem_statements WHERE event_id IN (SELECT id FROM public.events WHERE created_by = ANY(test_user_ids));
    DELETE FROM public.events WHERE created_by = ANY(test_user_ids);
    DELETE FROM public.user_profiles WHERE id = ANY(test_user_ids);
    DELETE FROM auth.users WHERE id = ANY(test_user_ids);
    
    RAISE NOTICE 'Test data cleanup completed';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$cleanup$;
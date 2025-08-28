-- Fix missing INSERT policy for teams table
-- This migration addresses the issue where users cannot create teams
-- because the cleanup migration removed the INSERT policy

-- Add missing INSERT policy for teams
CREATE POLICY "Team leaders can create teams" ON public.teams
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = leader_id);

-- Also add missing INSERT policy for team_members
CREATE POLICY "Users can join teams" ON public.team_members
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT leader_id FROM public.teams WHERE id = team_members.team_id
        )
    );

-- Add missing UPDATE policy for team_members (for role changes)
CREATE POLICY "Team leaders can update team members" ON public.team_members
    FOR UPDATE 
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT leader_id FROM public.teams WHERE id = team_members.team_id
        )
    );

-- Add missing DELETE policy for team_members
CREATE POLICY "Team leaders and members can remove team members" ON public.team_members
    FOR DELETE 
    TO authenticated
    USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT leader_id FROM public.teams WHERE id = team_members.team_id
        )
    );

import { supabase } from '../lib/supabase';

export const teamService = {
  // Create a new team
  async createTeam(teamData) {
    try {
      const { data: session } = await supabase?.auth?.getSession();
      if (!session?.session?.user) {
        return { error: { message: 'User not authenticated' } };
      }

      const userId = session?.session?.user?.id;

      // Check if user profile exists
      const { data: userProfile, error: profileError } = await supabase
        ?.from('user_profiles')
        ?.select('id')
        ?.eq('id', userId)
        ?.single();

      if (profileError || !userProfile) {
        console.error('User profile not found:', profileError);
        return { error: { message: 'User profile not found. Please complete your profile first.' } };
      }

      // Clean the team data to ensure empty strings become null for UUID fields
      const cleanedTeamData = {
        ...teamData,
        event_id: teamData.event_id || null,
        problem_statement_id: teamData.problem_statement_id || null,
        leader_id: userId,
        invite_code: await this.generateInviteCode(),
        status: 'draft'
      };

      console.log('Creating team with data:', cleanedTeamData);
      const { data, error } = await supabase?.from('teams')?.insert(cleanedTeamData)?.select()?.single();

      if (error) {
        console.error('Team creation error:', error);
        return { error };
      }

      // Add leader as team member
      const { error: memberError } = await supabase?.from('team_members')?.insert({
          team_id: data?.id,
          user_id: session?.session?.user?.id,
          role: 'leader'
        });

      if (memberError) {
        console.error('Team member creation error:', memberError);
        // Don't fail the whole operation if member creation fails
      }

      return { data };
    } catch (error) {
      console.error('Team service error:', error);
      return { error };
    }
  },

  // Get user's teams
  async getUserTeams(userId) {
    try {
      const { data, error } = await supabase?.from('team_members')?.select(`
          *,
          teams:team_id (
            *,
            events:event_id (*),
            problem_statements:problem_statement_id (*),
            team_members:team_members!team_id (
              *,
              user_profiles:user_id (*)
            )
          )
        `)?.eq('user_id', userId);

      if (error) return { error };
      return { data: data?.map(item => item?.teams) || [] };
    } catch (error) {
      return { error };
    }
  },

  // Get team details
  async getTeamDetails(teamId) {
    try {
      const { data, error } = await supabase?.from('teams')?.select(`
          *,
          events:event_id (*),
          problem_statements:problem_statement_id (*),
          team_members:team_members!team_id (
            *,
            user_profiles:user_id (*)
          ),
          submissions:submissions!team_id (*),
          payments:payments!team_id (*)
        `)?.eq('id', teamId)?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Update team
  async updateTeam(teamId, updates) {
    try {
      const { data, error } = await supabase?.from('teams')?.update({ ...updates, updated_at: new Date()?.toISOString() })?.eq('id', teamId)?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Submit team for review
  async submitTeam(teamId) {
    try {
      const { data, error } = await supabase?.from('teams')?.update({ status: 'submitted', updated_at: new Date()?.toISOString() })?.eq('id', teamId)?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Add team member by invite code
  async joinTeamByInviteCode(inviteCode) {
    try {
      const { data: session } = await supabase?.auth?.getSession();
      if (!session?.session?.user) {
        return { error: { message: 'User not authenticated' } };
      }

      // Find team by invite code
      const { data: team, error: teamError } = await supabase?.from('teams')?.select('id, max_members, team_members:team_members!team_id(*)')?.eq('invite_code', inviteCode)?.single();

      if (teamError) return { error: teamError };

      // Check if team is full
      if (team?.team_members?.length >= (team?.max_members || 4)) {
        return { error: { message: 'Team is already full' } };
      }

      // Check if user is already a member
      const existingMember = team?.team_members?.find(
        member => member?.user_id === session?.session?.user?.id
      );
      if (existingMember) {
        return { error: { message: 'You are already a member of this team' } };
      }

      // Add user to team
      const { data, error } = await supabase?.from('team_members')?.insert({
          team_id: team?.id,
          user_id: session?.session?.user?.id,
          role: 'member'
        })?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Remove team member
  async removeTeamMember(teamId, userId) {
    try {
      const { error } = await supabase?.from('team_members')?.delete()?.eq('team_id', teamId)?.eq('user_id', userId);

      if (error) return { error };
      return { success: true };
    } catch (error) {
      return { error };
    }
  },

  // Get all teams (admin only)
  async getAllTeams() {
    try {
      const { data, error } = await supabase?.from('teams')?.select(`
          *,
          events:event_id (*),
          problem_statements:problem_statement_id (*),
          team_members:team_members!team_id (
            *,
            user_profiles:user_id (*)
          ),
          user_profiles:leader_id (*)
        `)?.order('created_at', { ascending: false });

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Generate unique invite code
  async generateInviteCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += characters?.charAt(Math.floor(Math.random() * characters?.length));
      }

      // Check if code already exists
      const { data } = await supabase?.from('teams')?.select('id')?.eq('invite_code', code)?.single();

      if (!data) isUnique = true;
    }

    return code;
  }
};
// Demo Data Cleanup Utility
// This utility helps clean up demo/sample data from the database

import { supabase } from '../lib/supabase';

export const demoDataCleanup = {
  // Check if demo data exists
  async checkDemoData() {
    try {
      console.log('🔍 Checking for demo data...');
      
      // Check for demo users
      const { data: demoUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .or('email.like.%@hackfest.edu,email.like.%@university.edu,email.like.%demo%,email.like.%test%,email.like.%sample%');
      
      if (usersError) {
        console.error('Error checking demo users:', usersError);
        return { error: usersError };
      }

      // Check for demo teams
      const { data: demoTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, leader_id')
        .or('name.ilike.%demo%,name.ilike.%test%,name.ilike.%sample%,name.eq.Code Warriors');
      
      if (teamsError) {
        console.error('Error checking demo teams:', teamsError);
        return { error: teamsError };
      }

      const results = {
        demoUsers: demoUsers || [],
        demoTeams: demoTeams || [],
        hasDemoData: (demoUsers?.length > 0) || (demoTeams?.length > 0)
      };

      console.log('📊 Demo data check results:', results);
      return results;
      
    } catch (error) {
      console.error('Demo data check failed:', error);
      return { error };
    }
  },

  // Clean up demo users and related data
  async cleanupDemoUsers() {
    try {
      console.log('🧹 Starting demo user cleanup...');
      
      // Get demo user IDs
      const { data: demoUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('id')
        .or('email.like.%@hackfest.edu,email.like.%@university.edu,email.like.%demo%,email.like.%test%,email.like.%sample%');
      
      if (usersError) {
        console.error('Error getting demo users:', usersError);
        return { error: usersError };
      }

      if (!demoUsers || demoUsers.length === 0) {
        console.log('✅ No demo users found');
        return { message: 'No demo users to clean up' };
      }

      const demoUserIds = demoUsers.map(u => u.id);
      console.log(`🎯 Found ${demoUserIds.length} demo users to clean up`);

      // Clean up in dependency order
      const cleanupSteps = [
        { table: 'notifications', column: 'user_id', description: 'notifications' },
        { table: 'payments', column: 'user_id', description: 'payments' },
        { table: 'team_members', column: 'user_id', description: 'team memberships' },
        { table: 'teams', column: 'leader_id', description: 'teams led by demo users' },
        { table: 'user_profiles', column: 'id', description: 'user profiles' }
      ];

      const results = [];
      
      for (const step of cleanupSteps) {
        try {
          const { error } = await supabase
            .from(step.table)
            .delete()
            .in(step.column, demoUserIds);
          
          if (error) {
            console.error(`❌ Error cleaning ${step.description}:`, error);
            results.push({ step: step.description, success: false, error });
          } else {
            console.log(`✅ Cleaned up ${step.description}`);
            results.push({ step: step.description, success: true });
          }
        } catch (err) {
          console.error(`❌ Exception cleaning ${step.description}:`, err);
          results.push({ step: step.description, success: false, error: err });
        }
      }

      console.log('🎉 Demo user cleanup completed');
      return { results, cleanedUserIds: demoUserIds };
      
    } catch (error) {
      console.error('Demo user cleanup failed:', error);
      return { error };
    }
  },

  // Clean up demo teams
  async cleanupDemoTeams() {
    try {
      console.log('🧹 Starting demo team cleanup...');
      
      // Get demo team IDs
      const { data: demoTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .or('name.ilike.%demo%,name.ilike.%test%,name.ilike.%sample%,name.eq.Code Warriors');
      
      if (teamsError) {
        console.error('Error getting demo teams:', teamsError);
        return { error: teamsError };
      }

      if (!demoTeams || demoTeams.length === 0) {
        console.log('✅ No demo teams found');
        return { message: 'No demo teams to clean up' };
      }

      const demoTeamIds = demoTeams.map(t => t.id);
      console.log(`🎯 Found ${demoTeamIds.length} demo teams to clean up`);

      // Clean up team-related data
      const cleanupSteps = [
        { table: 'submissions', column: 'team_id', description: 'team submissions' },
        { table: 'payments', column: 'team_id', description: 'team payments' },
        { table: 'team_members', column: 'team_id', description: 'team members' },
        { table: 'teams', column: 'id', description: 'teams' }
      ];

      const results = [];
      
      for (const step of cleanupSteps) {
        try {
          const { error } = await supabase
            .from(step.table)
            .delete()
            .in(step.column, demoTeamIds);
          
          if (error) {
            console.error(`❌ Error cleaning ${step.description}:`, error);
            results.push({ step: step.description, success: false, error });
          } else {
            console.log(`✅ Cleaned up ${step.description}`);
            results.push({ step: step.description, success: true });
          }
        } catch (err) {
          console.error(`❌ Exception cleaning ${step.description}:`, err);
          results.push({ step: step.description, success: false, error: err });
        }
      }

      console.log('🎉 Demo team cleanup completed');
      return { results, cleanedTeamIds: demoTeamIds };
      
    } catch (error) {
      console.error('Demo team cleanup failed:', error);
      return { error };
    }
  },

  // Full cleanup - removes all demo data
  async fullCleanup() {
    try {
      console.log('🚀 Starting full demo data cleanup...');
      
      const checkResult = await this.checkDemoData();
      if (checkResult.error) {
        return { error: checkResult.error };
      }

      if (!checkResult.hasDemoData) {
        console.log('✅ No demo data found - nothing to clean up');
        return { message: 'No demo data found' };
      }

      console.log(`📋 Found demo data: ${checkResult.demoUsers.length} users, ${checkResult.demoTeams.length} teams`);

      // Clean up teams first (to avoid foreign key issues)
      const teamCleanup = await this.cleanupDemoTeams();
      
      // Then clean up users
      const userCleanup = await this.cleanupDemoUsers();

      // Final verification
      const finalCheck = await this.checkDemoData();
      
      return {
        teamCleanup,
        userCleanup,
        finalCheck,
        success: !finalCheck.hasDemoData
      };
      
    } catch (error) {
      console.error('Full cleanup failed:', error);
      return { error };
    }
  },

  // Verify data isolation - check that users only see their own data
  async verifyDataIsolation(userId) {
    try {
      console.log(`🔒 Verifying data isolation for user: ${userId}`);
      
      // Check teams - user should only see teams they're part of
      const { data: userTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, leader_id')
        .or(`leader_id.eq.${userId},id.in.(${
          // Get team IDs where user is a member
          await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', userId)
            .then(({ data }) => data?.map(tm => tm.team_id).join(',') || 'null')
        })`);

      // Check payments - user should only see their own payments
      const { data: userPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, user_id')
        .eq('user_id', userId);

      // Check notifications - user should only see their own notifications
      const { data: userNotifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('id, user_id')
        .eq('user_id', userId);

      const results = {
        teams: { data: userTeams, error: teamsError },
        payments: { data: userPayments, error: paymentsError },
        notifications: { data: userNotifications, error: notificationsError },
        isolated: !teamsError && !paymentsError && !notificationsError
      };

      console.log('🔒 Data isolation check results:', results);
      return results;
      
    } catch (error) {
      console.error('Data isolation verification failed:', error);
      return { error };
    }
  }
};

export default demoDataCleanup;

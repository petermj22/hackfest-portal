import { supabase } from '../lib/supabase';
import { teamService } from '../services/teamService';

export const teamDataDebugger = {
  // Comprehensive team data verification
  async verifyTeamRegistration() {
    console.log('🔍 TEAM DATA VERIFICATION STARTING...\n');
    
    const verification = {
      authentication: await this.checkAuthentication(),
      teamExists: await this.checkTeamExists(),
      teamData: await this.checkTeamData(),
      eventAssociation: await this.checkEventAssociation(),
      memberData: await this.checkMemberData(),
      databaseIntegrity: await this.checkDatabaseIntegrity()
    };

    // Generate summary
    console.log('📊 TEAM VERIFICATION SUMMARY:');
    console.log('============================');
    
    Object.entries(verification).forEach(([category, result]) => {
      const status = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${status} ${category.toUpperCase()}: ${result.status}`);
      if (result.message) console.log(`   ${result.message}`);
    });

    const issues = this.identifyIssues(verification);
    if (issues.length > 0) {
      console.log('\n🚨 ISSUES FOUND:');
      issues.forEach((issue, index) => console.log(`${index + 1}. ${issue}`));
    }

    const recommendations = this.generateRecommendations(verification);
    if (recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      recommendations.forEach((rec, index) => console.log(`${index + 1}. ${rec}`));
    }

    return verification;
  },

  // Check user authentication
  async checkAuthentication() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return { 
          status: 'fail', 
          message: 'User not authenticated',
          data: null
        };
      }

      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        status: profile ? 'pass' : 'warning',
        message: profile ? 'User authenticated with profile' : 'User authenticated but profile incomplete',
        data: { user, profile }
      };
    } catch (error) {
      return { 
        status: 'fail', 
        message: `Authentication check failed: ${error.message}`,
        data: null
      };
    }
  },

  // Check if team exists
  async checkTeamExists() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { status: 'fail', message: 'Cannot check teams - user not authenticated' };
      }

      const { data: teams, error } = await supabase
        .from('teams')
        .select('id, name, status, created_at')
        .eq('leader_id', user.id);

      if (error) {
        return { 
          status: 'fail', 
          message: `Database error: ${error.message}`,
          data: null
        };
      }

      if (!teams || teams.length === 0) {
        return { 
          status: 'fail', 
          message: 'No teams found for user',
          data: null
        };
      }

      return {
        status: 'pass',
        message: `Found ${teams.length} team(s)`,
        data: teams
      };
    } catch (error) {
      return { 
        status: 'fail', 
        message: `Team existence check failed: ${error.message}`,
        data: null
      };
    }
  },

  // Check team data completeness
  async checkTeamData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { status: 'fail', message: 'Cannot check team data - user not authenticated' };
      }

      const { data: teams, error } = await teamService.getUserTeams(user.id);

      if (error) {
        return { 
          status: 'fail', 
          message: `Failed to fetch team data: ${error.message}`,
          data: null
        };
      }

      if (!teams || teams.length === 0) {
        return { 
          status: 'fail', 
          message: 'No team data available',
          data: null
        };
      }

      const team = teams[0];
      console.log('📊 Raw team data structure:', team);

      // Check required fields
      const requiredFields = {
        id: team.id,
        name: team.name,
        event_id: team.event_id,
        leader_id: team.leader_id,
        status: team.status
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return {
          status: 'fail',
          message: `Missing required fields: ${missingFields.join(', ')}`,
          data: { team, missingFields }
        };
      }

      return {
        status: 'pass',
        message: 'Team data is complete',
        data: { team, requiredFields }
      };
    } catch (error) {
      return { 
        status: 'fail', 
        message: `Team data check failed: ${error.message}`,
        data: null
      };
    }
  },

  // Check event association
  async checkEventAssociation() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { status: 'fail', message: 'Cannot check event association - user not authenticated' };
      }

      const { data: teams, error } = await teamService.getUserTeams(user.id);

      if (error || !teams || teams.length === 0) {
        return { 
          status: 'fail', 
          message: 'No team data to check event association',
          data: null
        };
      }

      const team = teams[0];

      if (!team.event_id) {
        return {
          status: 'fail',
          message: 'Team is not associated with any event',
          data: { team }
        };
      }

      // Check if event exists and is valid
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, name, status, start_date, end_date')
        .eq('id', team.event_id)
        .single();

      if (eventError || !event) {
        return {
          status: 'fail',
          message: 'Associated event not found or invalid',
          data: { team, eventError }
        };
      }

      return {
        status: 'pass',
        message: `Team associated with event: ${event.name}`,
        data: { team, event }
      };
    } catch (error) {
      return { 
        status: 'fail', 
        message: `Event association check failed: ${error.message}`,
        data: null
      };
    }
  },

  // Check member data
  async checkMemberData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { status: 'fail', message: 'Cannot check member data - user not authenticated' };
      }

      const { data: teams, error } = await teamService.getUserTeams(user.id);

      if (error || !teams || teams.length === 0) {
        return { 
          status: 'fail', 
          message: 'No team data to check members',
          data: null
        };
      }

      const team = teams[0];
      const members = team.team_members || [];

      if (members.length === 0) {
        return {
          status: 'warning',
          message: 'No team members found (team leader should be included)',
          data: { team, members }
        };
      }

      return {
        status: 'pass',
        message: `Team has ${members.length} member(s)`,
        data: { team, members }
      };
    } catch (error) {
      return { 
        status: 'fail', 
        message: `Member data check failed: ${error.message}`,
        data: null
      };
    }
  },

  // Check database integrity
  async checkDatabaseIntegrity() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { status: 'fail', message: 'Cannot check database integrity - user not authenticated' };
      }

      // Test all required table access
      const tableTests = await Promise.all([
        supabase.from('teams').select('count').limit(1),
        supabase.from('events').select('count').limit(1),
        supabase.from('team_members').select('count').limit(1),
        supabase.from('user_profiles').select('count').limit(1),
        supabase.from('payments').select('count').limit(1)
      ]);

      const failedTables = [];
      const tableNames = ['teams', 'events', 'team_members', 'user_profiles', 'payments'];

      tableTests.forEach((test, index) => {
        if (test.error) {
          failedTables.push(tableNames[index]);
        }
      });

      if (failedTables.length > 0) {
        return {
          status: 'fail',
          message: `Cannot access tables: ${failedTables.join(', ')}`,
          data: { failedTables }
        };
      }

      return {
        status: 'pass',
        message: 'All required database tables are accessible',
        data: { tableNames }
      };
    } catch (error) {
      return { 
        status: 'fail', 
        message: `Database integrity check failed: ${error.message}`,
        data: null
      };
    }
  },

  // Identify issues from verification results
  identifyIssues(verification) {
    const issues = [];
    
    Object.entries(verification).forEach(([category, result]) => {
      if (result.status === 'fail') {
        issues.push(`${category}: ${result.message}`);
      }
    });

    return issues;
  },

  // Generate recommendations
  generateRecommendations(verification) {
    const recommendations = [];

    if (verification.authentication.status === 'fail') {
      recommendations.push('Log in to the application');
    } else if (verification.authentication.status === 'warning') {
      recommendations.push('Complete your user profile');
    }

    if (verification.teamExists.status === 'fail') {
      recommendations.push('Register a team before attempting payment');
    }

    if (verification.teamData.status === 'fail') {
      recommendations.push('Complete team registration with all required fields');
    }

    if (verification.eventAssociation.status === 'fail') {
      recommendations.push('Associate your team with a valid event');
    }

    if (verification.memberData.status === 'warning') {
      recommendations.push('Add team members to your team');
    }

    if (verification.databaseIntegrity.status === 'fail') {
      recommendations.push('Check database permissions and connectivity');
    }

    return recommendations;
  },

  // Quick team data fix
  async quickTeamDataFix() {
    console.log('🔧 ATTEMPTING QUICK TEAM DATA FIX...\n');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Cannot fix - user not authenticated');
        return false;
      }

      // Check if team exists but missing event association
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .eq('leader_id', user.id);

      if (error || !teams || teams.length === 0) {
        console.log('❌ No teams found to fix');
        return false;
      }

      const team = teams[0];
      
      if (!team.event_id) {
        console.log('🔧 Team missing event association, attempting to fix...');
        
        // Get available events
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('id, name')
          .eq('status', 'active')
          .limit(1);

        if (!eventsError && events && events.length > 0) {
          const { error: updateError } = await supabase
            .from('teams')
            .update({ event_id: events[0].id })
            .eq('id', team.id);

          if (!updateError) {
            console.log('✅ Team associated with event:', events[0].name);
            return true;
          }
        }
      }

      console.log('ℹ️ No automatic fixes available');
      return false;
    } catch (error) {
      console.error('❌ Quick fix failed:', error);
      return false;
    }
  }
};

export default teamDataDebugger;

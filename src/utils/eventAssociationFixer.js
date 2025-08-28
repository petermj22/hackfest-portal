import { supabase } from '../lib/supabase';

export const eventAssociationFixer = {
  // Diagnose event association issues
  async diagnoseEventAssociation() {
    console.log('🔍 Diagnosing Event Association...\n');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          success: false, 
          error: 'User not authenticated',
          diagnosis: null
        };
      }

      // Get user's teams
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          event_id,
          status,
          created_at,
          events(id, name, status, start_date, end_date)
        `)
        .eq('leader_id', user.id);

      if (teamsError) {
        return { 
          success: false, 
          error: `Failed to fetch teams: ${teamsError.message}`,
          diagnosis: null
        };
      }

      if (!teams || teams.length === 0) {
        return { 
          success: false, 
          error: 'No teams found for user',
          diagnosis: null
        };
      }

      const team = teams[0];
      
      // Get available events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, name, status, start_date, end_date, description')
        .order('created_at', { ascending: false });

      if (eventsError) {
        return { 
          success: false, 
          error: `Failed to fetch events: ${eventsError.message}`,
          diagnosis: null
        };
      }

      const diagnosis = {
        team: {
          id: team.id,
          name: team.name,
          hasEventId: !!team.event_id,
          eventId: team.event_id,
          associatedEvent: team.events,
          status: team.status
        },
        availableEvents: events || [],
        activeEvents: events?.filter(e => e.status === 'active') || [],
        recommendations: []
      };

      // Generate recommendations
      if (!team.event_id) {
        diagnosis.recommendations.push('Team needs to be associated with an event');
        
        if (diagnosis.activeEvents.length > 0) {
          diagnosis.recommendations.push(`${diagnosis.activeEvents.length} active event(s) available for association`);
        } else {
          diagnosis.recommendations.push('No active events found - may need to create an event first');
        }
      } else if (team.events && team.events.status !== 'active') {
        diagnosis.recommendations.push('Team is associated with inactive event - consider switching to active event');
      } else {
        diagnosis.recommendations.push('Team event association looks good');
      }

      console.log('📊 Event Association Diagnosis:', diagnosis);

      return { 
        success: true, 
        error: null,
        diagnosis: diagnosis
      };

    } catch (error) {
      console.error('❌ Diagnosis failed:', error);
      return { 
        success: false, 
        error: error.message,
        diagnosis: null
      };
    }
  },

  // Auto-fix event association
  async autoFixEventAssociation() {
    console.log('🔧 Starting Auto-Fix for Event Association...\n');
    
    try {
      // First diagnose the situation
      const diagnosisResult = await this.diagnoseEventAssociation();
      
      if (!diagnosisResult.success) {
        console.error('❌ Cannot auto-fix: Diagnosis failed');
        return { 
          success: false, 
          error: diagnosisResult.error,
          action: 'diagnosis_failed'
        };
      }

      const { diagnosis } = diagnosisResult;
      
      // If team already has valid event association, no fix needed
      if (diagnosis.team.hasEventId && diagnosis.team.associatedEvent?.status === 'active') {
        console.log('✅ Team already has valid event association');
        return { 
          success: true, 
          error: null,
          action: 'no_fix_needed',
          eventName: diagnosis.team.associatedEvent.name
        };
      }

      // Check if there are active events available
      if (diagnosis.activeEvents.length === 0) {
        console.error('❌ No active events available for association');
        return { 
          success: false, 
          error: 'No active events found. Please create an event first.',
          action: 'no_events_available'
        };
      }

      // Select the most appropriate event (first active event)
      const targetEvent = diagnosis.activeEvents[0];
      console.log('🎪 Associating team with event:', targetEvent.name);

      // Update team with event association
      const { error: updateError } = await supabase
        .from('teams')
        .update({ 
          event_id: targetEvent.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', diagnosis.team.id);

      if (updateError) {
        console.error('❌ Failed to update team:', updateError);
        return { 
          success: false, 
          error: `Failed to associate team with event: ${updateError.message}`,
          action: 'update_failed'
        };
      }

      console.log('✅ SUCCESS! Team associated with event:', targetEvent.name);
      console.log('🔄 Event association fix completed');

      return { 
        success: true, 
        error: null,
        action: 'association_created',
        eventName: targetEvent.name,
        eventId: targetEvent.id
      };

    } catch (error) {
      console.error('❌ Auto-fix failed:', error);
      return { 
        success: false, 
        error: error.message,
        action: 'exception_occurred'
      };
    }
  },

  // Manual event selection
  async associateTeamWithEvent(eventId) {
    console.log('🔧 Manually Associating Team with Event:', eventId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          success: false, 
          error: 'User not authenticated'
        };
      }

      // Verify event exists and is valid
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, name, status')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return { 
          success: false, 
          error: 'Selected event not found or invalid'
        };
      }

      // Get user's team
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('leader_id', user.id);

      if (teamsError || !teams || teams.length === 0) {
        return { 
          success: false, 
          error: 'No teams found for user'
        };
      }

      const team = teams[0];

      // Update team with selected event
      const { error: updateError } = await supabase
        .from('teams')
        .update({ 
          event_id: eventId,
          updated_at: new Date().toISOString()
        })
        .eq('id', team.id);

      if (updateError) {
        return { 
          success: false, 
          error: `Failed to associate team with event: ${updateError.message}`
        };
      }

      console.log('✅ Team successfully associated with event:', event.name);

      return { 
        success: true, 
        error: null,
        eventName: event.name,
        eventId: event.id
      };

    } catch (error) {
      console.error('❌ Manual association failed:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  },

  // Verify event association after fix
  async verifyEventAssociation() {
    console.log('✅ Verifying Event Association...\n');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { 
          success: false, 
          error: 'User not authenticated'
        };
      }

      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          event_id,
          events(id, name, status)
        `)
        .eq('leader_id', user.id);

      if (error || !teams || teams.length === 0) {
        return { 
          success: false, 
          error: 'No teams found'
        };
      }

      const team = teams[0];
      const hasEventId = !!team.event_id;
      const hasValidEvent = hasEventId && team.events;

      console.log('📊 Verification Results:');
      console.log('Team Name:', team.name);
      console.log('Has Event ID:', hasEventId ? '✅' : '❌');
      console.log('Event Name:', team.events?.name || 'No event');
      console.log('Event Status:', team.events?.status || 'N/A');

      return { 
        success: hasValidEvent, 
        error: hasValidEvent ? null : 'Event association still missing',
        team: {
          name: team.name,
          hasEventId: hasEventId,
          eventName: team.events?.name,
          eventStatus: team.events?.status
        }
      };

    } catch (error) {
      console.error('❌ Verification failed:', error);
      return { 
        success: false, 
        error: error.message
      };
    }
  },

  // Get available events for manual selection
  async getAvailableEvents() {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('id, name, status, start_date, end_date, description')
        .order('created_at', { ascending: false });

      if (error) {
        return { 
          success: false, 
          error: error.message,
          events: []
        };
      }

      return { 
        success: true, 
        error: null,
        events: events || []
      };

    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        events: []
      };
    }
  }
};

export default eventAssociationFixer;

import { supabase } from '../lib/supabase';

export const eventService = {
  // Get all events
  async getEvents() {
    try {
      const { data, error } = await supabase?.from('events')?.select(`
          *,
          problem_statements:problem_statements!event_id (count),
          teams:teams!event_id (count)
        `)?.order('created_at', { ascending: false });

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Get active events (registration open)
  async getActiveEvents() {
    try {
      const now = new Date()?.toISOString();
      const { data, error } = await supabase?.from('events')?.select('*')?.lte('registration_start', now)?.gte('registration_end', now)?.eq('status', 'upcoming')?.order('start_date', { ascending: true });

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Get event details
  async getEventDetails(eventId) {
    try {
      const { data, error } = await supabase?.from('events')?.select(`
          *,
          problem_statements:problem_statements!event_id (*),
          teams:teams!event_id (
            *,
            team_members:team_members!team_id (count)
          )
        `)?.eq('id', eventId)?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Get event updates
  async getEventUpdates(eventId, limit = 10) {
    try {
      const { data, error } = await supabase?.from('event_updates')?.select(`
          *,
          author:author_id (full_name, role)
        `)?.eq('event_id', eventId)?.order('published_at', { ascending: false })?.limit(limit);

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Get problem statements for event
  async getProblemStatements(eventId) {
    try {
      const { data, error } = await supabase?.from('problem_statements')?.select('*')?.eq('event_id', eventId)?.eq('is_active', true)?.order('created_at', { ascending: false });

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Create event (admin only)
  async createEvent(eventData) {
    try {
      const { data: session } = await supabase?.auth?.getSession();
      if (!session?.session?.user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('events')?.insert({
          ...eventData,
          created_by: session?.session?.user?.id
        })?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Update event (admin only)
  async updateEvent(eventId, updates) {
    try {
      const { data, error } = await supabase?.from('events')?.update({ ...updates, updated_at: new Date()?.toISOString() })?.eq('id', eventId)?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  }
};
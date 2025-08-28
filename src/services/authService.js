import { supabase } from '../lib/supabase';

export const authService = {
  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase?.auth?.getSession();
      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase?.auth?.getUser();
      if (error) return { error };
      return { user };
    } catch (error) {
      return { error };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update({ ...updates, updated_at: new Date()?.toISOString() })?.eq('id', userId)?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Check if user exists by email
  async checkUserExists(email) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('id, email')?.eq('email', email?.toLowerCase())?.single();

      if (error && error?.code !== 'PGRST116') return { error };
      return { exists: !!data };
    } catch (error) {
      return { error };
    }
  }
};
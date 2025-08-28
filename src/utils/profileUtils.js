import { supabase } from '../lib/supabase';

export const profileUtils = {
  // Check if current user has a profile
  async checkCurrentUserProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { hasProfile: false, error: 'User not authenticated' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        return { hasProfile: false, error: profileError.message };
      }

      return { 
        hasProfile: !!profile, 
        user, 
        profile,
        needsProfile: !profile 
      };
    } catch (error) {
      return { hasProfile: false, error: error.message };
    }
  },

  // Create profile for current user
  async createCurrentUserProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { error: { message: 'User not authenticated' } };
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        return { error: { message: 'Profile already exists' } };
      }

      // Create new profile
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 
                  user.user_metadata?.name || 
                  user.email?.split('@')[0] || 
                  'User',
        role: 'participant',
        profile_picture_url: user.user_metadata?.avatar_url || 
                           user.user_metadata?.picture || 
                           null,
        is_verified: !!user.email_confirmed_at
      };

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return { error: createError };
      }

      return { data: newProfile };
    } catch (error) {
      console.error('Profile creation error:', error);
      return { error };
    }
  },

  // Fix missing profiles for all authenticated users
  async fixMissingProfiles() {
    try {
      console.log('🔍 Checking for users without profiles...');
      
      // This requires admin access, so we'll just fix the current user
      const result = await this.createCurrentUserProfile();
      
      if (result.error && !result.error.message.includes('already exists')) {
        console.error('❌ Failed to create profile:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ Profile check/creation completed');
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Profile fix error:', error);
      return { success: false, error };
    }
  }
};

export default profileUtils;

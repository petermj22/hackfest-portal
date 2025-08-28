import { supabase } from '../lib/supabase';

export const notificationService = {
  // Get user notifications
  async getUserNotifications(userId, limit = 50) {
    try {
      const { data, error } = await supabase?.from('notifications')?.select('*')?.eq('user_id', userId)?.order('created_at', { ascending: false })?.limit(limit);

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase?.from('notifications')?.update({ read: true })?.eq('id', notificationId)?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase?.from('notifications')?.update({ read: true })?.eq('user_id', userId)?.eq('read', false);

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase?.from('notifications')?.select('*', { count: 'exact', head: true })?.eq('user_id', userId)?.eq('read', false);

      if (error) return { error };
      return { count };
    } catch (error) {
      return { error };
    }
  },

  // Create notification (admin function)
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase?.from('notifications')?.insert(notificationData)?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId, callback) {
    const channel = supabase?.channel('notifications')?.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        payload => {
          callback?.(payload?.new);
        }
      )?.subscribe();

    return () => supabase?.removeChannel(channel);
  },

  // Get bookmarked updates
  async getBookmarkedUpdates(userId) {
    try {
      const { data, error } = await supabase?.from('bookmarked_updates')?.select(`
          *,
          event_updates:update_id (
            *,
            events:event_id (name)
          )
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Bookmark update
  async bookmarkUpdate(updateId) {
    try {
      const { data: session } = await supabase?.auth?.getSession();
      if (!session?.session?.user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('bookmarked_updates')?.insert({
          user_id: session?.session?.user?.id,
          update_id: updateId
        })?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Remove bookmark
  async removeBookmark(updateId) {
    try {
      const { data: session } = await supabase?.auth?.getSession();
      if (!session?.session?.user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase?.from('bookmarked_updates')?.delete()?.eq('user_id', session?.session?.user?.id)?.eq('update_id', updateId);

      if (error) return { error };
      return { success: true };
    } catch (error) {
      return { error };
    }
  }
};
import { supabase } from '../lib/supabase';

export const paymentService = {
  // Create payment record
  async createPayment(paymentData) {
    try {
      const { data: session } = await supabase?.auth?.getSession();
      if (!session?.session?.user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase?.from('payments')?.insert({
          ...paymentData,
          user_id: session?.session?.user?.id,
          status: 'pending'
        })?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Update payment status
  async updatePaymentStatus(paymentId, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        ...additionalData
      };

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const { data, error } = await supabase?.from('payments')?.update(updateData)?.eq('id', paymentId)?.select()?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Get user payments
  async getUserPayments(userId) {
    try {
      const { data, error } = await supabase?.from('payments')?.select(`
          *,
          events:event_id (*),
          teams:team_id (*)
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const { data, error } = await supabase?.from('payments')?.select(`
          *,
          events:event_id (*),
          teams:team_id (*),
          user_profiles:user_id (*)
        `)?.eq('id', paymentId)?.single();

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Check if user has paid for event
  async checkEventPayment(userId, eventId) {
    try {
      const { data, error } = await supabase?.from('payments')?.select('*')?.eq('user_id', userId)?.eq('event_id', eventId)?.eq('status', 'paid')?.single();

      if (error && error?.code !== 'PGRST116') return { error };
      return { hasPaid: !!data, payment: data };
    } catch (error) {
      return { error };
    }
  },

  // Get all payments (admin only)
  async getAllPayments() {
    try {
      const { data, error } = await supabase?.from('payments')?.select(`
          *,
          user_profiles:user_id (*),
          teams:team_id (*),
          events:event_id (*)
        `)?.order('created_at', { ascending: false });

      if (error) return { error };
      return { data };
    } catch (error) {
      return { error };
    }
  },

  // Get payment statistics (admin)
  async getPaymentStats(eventId = null) {
    try {
      let query = supabase?.from('payments')?.select('status, amount, created_at');

      if (eventId) {
        query = query?.eq('event_id', eventId);
      }

      const { data, error } = await query;

      if (error) return { error };

      const stats = {
        total: data?.length || 0,
        paid: data?.filter(p => p?.status === 'paid')?.length || 0,
        pending: data?.filter(p => p?.status === 'pending')?.length || 0,
        failed: data?.filter(p => p?.status === 'failed')?.length || 0,
        totalAmount: data
          ?.filter(p => p?.status === 'paid')
          ?.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0) || 0
      };

      return { data: stats };
    } catch (error) {
      return { error };
    }
  }
};
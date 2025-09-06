import { useState, useEffect } from 'react';
import { supabase, Trip } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTrips();
    } else {
      setTrips([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([{ ...tripData, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      setTrips(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      return { data: null, error };
    }
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trips')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString(),
          user_id: user.id // Ensure user_id is always included
        })
        .eq('id', id)
        .eq('user_id', user.id) // Additional security check
        .select()
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned from update operation');
      }
      
      setTrips(prev => prev.map(trip => trip.id === id ? data : trip));
      return { data, error: null };
    } catch (err) {
      console.error('Error updating trip:', err);
      const error = err instanceof Error ? err.message : 'An error occurred';
      return { data: null, error };
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTrips(prev => prev.filter(trip => trip.id !== id));
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';
      return { error };
    }
  };

  return {
    trips,
    loading,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
  };
};
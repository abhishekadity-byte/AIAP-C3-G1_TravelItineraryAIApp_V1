import { useState, useEffect } from 'react';
import { supabase, Trip } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useTrips = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips:', error);
        return;
      }

      setTrips(data || []);
    } catch (error) {
      console.error('Unexpected error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const createTrip = async (tripData: Omit<Trip, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([
          {
            ...tripData,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating trip:', error);
        return { data: null, error: error.message };
      }

      console.log('Trip created successfully:', data);
      setTrips(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error creating trip:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to create trip' };
    }
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      // Remove undefined values and system fields
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );
      
      // Remove system fields that shouldn't be updated
      delete cleanUpdates.id;
      delete cleanUpdates.user_id;
      delete cleanUpdates.created_at;
      delete cleanUpdates.updated_at;
      
      console.log('Clean updates:', cleanUpdates);

      const { data, error } = await supabase
        .from('trips')
        .update(cleanUpdates)
        .eq('id', tripId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating trip:', error);
        return { data: null, error: error.message };
      }

      console.log('Trip updated successfully:', data);
      
      setTrips(prev => prev.map(trip => trip.id === tripId ? data : trip));
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error updating trip:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to update trip' };
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting trip:', error);
        return { data: null, error: error.message };
      }

      console.log('Trip deleted successfully');
      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected error deleting trip:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to delete trip' };
    }
  };

  return {
    trips,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    refetch: fetchTrips,
  };
};
import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, MapPin, Calendar, Users, DollarSign, Edit, Eye, Trash2, LogOut, Plane, Bot } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, Trip, UserProfile } from '../lib/supabase';
import TripModal from './TripModal';
import AIChatModal from './AIChatModal';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchTrips();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips:', error);
      } else {
        setTrips(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: any) => {
    try {
      console.log('Creating trip with data:', tripData);
      
      const { data, error } = await supabase
        .from('trips')
        .insert([{
          ...tripData,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating trip:', error);
        return { data: null, error: error.message };
      }

      console.log('Trip created successfully:', data);
      await fetchTrips(); // Refresh trips list
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error creating trip:', err);
      return { data: null, error: err instanceof Error ? err.message : 'An unexpected error occurred' };
    }
  };

  const updateTrip = async (tripId: string, updates: any) => {
    try {
      console.log('Updating trip:', tripId, 'with updates:', updates);
      
      // Clean the updates object - remove undefined values and user_id
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key, value]) => 
          value !== undefined && key !== 'user_id' && key !== 'id' && key !== 'created_at'
        )
      );
      
      console.log('Clean updates:', cleanUpdates);
      
      const { data, error } = await supabase
        .from('trips')
        .update(cleanUpdates)
        .eq('id', tripId)
        .eq('user_id', user?.id) // Ensure user can only update their own trips
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        return { data: null, error: error.message };
      }

      console.log('Trip updated successfully:', data);
      await fetchTrips(); // Refresh trips list
      return { data, error: null };
    } catch (err) {
      console.error('Unexpected error updating trip:', err);
      return { data: null, error: err instanceof Error ? err.message : 'An unexpected error occurred' };
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip');
      } else {
        await fetchTrips(); // Refresh trips list
      }
    } catch (err) {
      console.error('Unexpected error deleting trip:', err);
      alert('An unexpected error occurred');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openTripModal = (mode: 'create' | 'edit' | 'view', trip?: Trip) => {
    setModalMode(mode);
    setSelectedTrip(trip || null);
    setTripModalOpen(true);
  };

  const closeTripModal = () => {
    setTripModalOpen(false);
    setSelectedTrip(null);
  };

  const handleCreateTripFromChat = (tripData: any) => {
    // This will be called from the AI chat modal
    createTrip(tripData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTripTypeIcon = (type: string) => {
    switch (type) {
      case 'business': return '💼';
      case 'adventure': return '🏔️';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'romantic': return '💕';
      case 'solo': return '🧳';
      default: return '✈️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2 mr-3 shadow-lg">
                <Plane size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">JourneyVerse</h1>
                <p className="text-purple-200 text-sm">Welcome back, {userProfile?.full_name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setChatModalOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
              >
                <Bot size={20} className="mr-2" />
                AI Assistant
              </button>
              <button
                onClick={() => openTripModal('create')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
              >
                <Plus size={20} className="mr-2" />
                New Trip
              </button>
              <button
                onClick={handleSignOut}
                className="text-purple-200 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {trips.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/30 max-w-2xl mx-auto shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 shadow-lg">
                  <Plane size={48} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Start Your Journey</h2>
              <p className="text-purple-200 mb-8 leading-relaxed">
                Welcome to JourneyVerse! Create your first trip or chat with our AI assistant to plan the perfect adventure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setChatModalOpen(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <Bot size={20} className="mr-2" />
                  Chat with AI Assistant
                </button>
                <button
                  onClick={() => openTripModal('create')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} className="mr-2" />
                  Create Manual Trip
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Trips Grid */
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Your Trips</h2>
              <p className="text-purple-200">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-black/30 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200 shadow-lg hover:shadow-xl">
                  {/* Trip Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getTripTypeIcon(trip.trip_type)}</span>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{trip.title}</h3>
                        <div className="flex items-center text-purple-300 text-sm">
                          <MapPin size={14} className="mr-1" />
                          {trip.destination}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-purple-200 text-sm">
                      <Calendar size={14} className="mr-2 text-purple-400" />
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-purple-200 text-sm">
                      <Users size={14} className="mr-2 text-purple-400" />
                      {trip.travelers_count} traveler{trip.travelers_count !== 1 ? 's' : ''}
                    </div>
                    {trip.budget && (
                      <div className="flex items-center text-purple-200 text-sm">
                        <DollarSign size={14} className="mr-2 text-purple-400" />
                        ${trip.budget.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-purple-500/20">
                    <button
                      onClick={() => openTripModal('view', trip)}
                      className="text-purple-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => openTripModal('edit', trip)}
                      className="text-purple-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                      title="Edit Trip"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteTrip(trip.id)}
                      className="text-pink-300 hover:text-pink-200 transition-colors p-2 hover:bg-pink-500/10 rounded-lg"
                      title="Delete Trip"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TripModal
        isOpen={tripModalOpen}
        onClose={closeTripModal}
        trip={selectedTrip}
        mode={modalMode}
        onSave={modalMode === 'create' ? createTrip : (id: string, updates: any) => updateTrip(id, updates)}
      />

      <AIChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        onCreateTrip={handleCreateTripFromChat}
      />
    </div>
  );
};

export default Dashboard;
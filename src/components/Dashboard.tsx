import React, { useState, useEffect } from 'react';
import { Plus, LogOut, Bot, MapPin, Calendar, Users, DollarSign, Edit, Trash2, Eye, Plane } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTrips } from '../hooks/useTrips';
import AIChatModal from './AIChatModal';
import TripModal from './TripModal';
import { Trip } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { trips, loading, createTrip, updateTrip, deleteTrip } = useTrips();
  const [showAIChat, setShowAIChat] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCreateTrip = (tripData: any) => {
    setSelectedTrip(null);
    setModalMode('create');
    setShowTripModal(true);
    
    // If coming from AI chat, pre-fill the modal
    if (tripData) {
      // The modal will handle the pre-filled data
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setModalMode('edit');
    setShowTripModal(true);
  };

  const handleViewTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setModalMode('view');
    setShowTripModal(true);
  };

  const handleDeleteTrip = async (trip: Trip) => {
    if (window.confirm(`Are you sure you want to delete "${trip.title}"?`)) {
      const result = await deleteTrip(trip.id);
      if (result.error) {
        alert('Failed to delete trip: ' + result.error);
      }
    }
  };

  const handleSaveTrip = async (tripDataOrId: any, updateData?: any) => {
    try {
      let result;
      if (modalMode === 'create') {
        result = await createTrip(tripDataOrId);
      } else if (modalMode === 'edit' && updateData) {
        result = await updateTrip(tripDataOrId, updateData);
      }
      
      if (result?.error) {
        return { data: null, error: result.error };
      }
      
      setShowTripModal(false);
      return { data: result?.data, error: null };
    } catch (error) {
      console.error('Error saving trip:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to save trip' };
    }
  };

  const handleCreateTripFromAI = (tripData: any) => {
    setShowAIChat(false);
    // Create the trip directly from AI data
    createTrip(tripData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'confirmed': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'completed': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-6"></div>
          <p className="text-purple-200 text-lg">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 shadow-2xl mr-4">
                <Plane size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">JourneyVerse</h1>
                <p className="text-purple-200 text-sm">Your AI-powered travel companion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-white font-medium text-lg">{user?.user_metadata?.full_name || 'Traveler'}</p>
                <p className="text-purple-300 text-sm">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-6 py-3 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-all duration-200 border border-purple-400/30 hover:scale-105 shadow-lg"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={() => setShowAIChat(true)}
            className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-2xl hover:shadow-purple-500/25 hover:scale-105 text-lg font-semibold"
          >
            <Bot size={24} className="mr-3" />
            Plan with AI Assistant
          </button>
          
          <button
            onClick={() => handleCreateTrip(null)}
            className="flex items-center justify-center px-8 py-4 bg-black/40 backdrop-blur-xl text-white rounded-xl hover:bg-black/50 transition-all duration-200 border border-purple-500/30 shadow-xl hover:scale-105 text-lg font-semibold"
          >
            <Plus size={24} className="mr-3" />
            Create Trip Manually
          </button>
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-16 border border-purple-500/30 shadow-2xl max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-6 w-24 h-24 mx-auto mb-8 shadow-2xl">
                <Plane size={48} className="text-white animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Ready for Your Next Adventure?</h3>
              <p className="text-purple-200 text-lg mb-10 leading-relaxed">
                Start planning your perfect trip with our AI assistant or create one manually. 
                Your journey to amazing destinations begins here!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowAIChat(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-xl hover:scale-105 text-lg font-semibold"
                >
                  <Bot size={20} className="inline mr-2" />
                  Start with AI
                </button>
                <button
                  onClick={() => handleCreateTrip(null)}
                  className="px-8 py-4 bg-black/40 backdrop-blur-xl text-white rounded-xl hover:bg-black/50 transition-all duration-200 border border-purple-500/30 shadow-xl hover:scale-105 text-lg font-semibold"
                >
                  <Plus size={20} className="inline mr-2" />
                  Create Manually
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:border-purple-400/50"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{getTripTypeIcon(trip.trip_type)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{trip.title}</h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trip.status)}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-purple-200">
                    <MapPin size={18} className="mr-3 text-purple-400" />
                    <span className="font-medium">{trip.destination}</span>
                  </div>
                  
                  <div className="flex items-center text-purple-200">
                    <Calendar size={18} className="mr-3 text-purple-400" />
                    <span className="font-medium">
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-purple-200">
                      <Users size={18} className="mr-3 text-purple-400" />
                      <span className="font-medium">{trip.travelers_count} traveler{trip.travelers_count !== 1 ? 's' : ''}</span>
                    </div>
                    
                    {trip.budget && (
                      <div className="flex items-center text-purple-200">
                        <DollarSign size={18} className="mr-2 text-purple-400" />
                        <span className="font-medium">${trip.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => handleViewTrip(trip)}
                    className="flex items-center px-4 py-2 bg-purple-500/20 text-purple-200 rounded-lg hover:bg-purple-500/30 transition-colors border border-purple-400/30 hover:scale-105"
                  >
                    <Eye size={16} className="mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditTrip(trip)}
                    className="flex items-center px-4 py-2 bg-blue-500/20 text-blue-200 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30 hover:scale-105"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip)}
                    className="flex items-center px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition-colors border border-red-400/30 hover:scale-105"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AIChatModal
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        onCreateTrip={handleCreateTripFromAI}
      />

      <TripModal
        isOpen={showTripModal}
        onClose={() => setShowTripModal(false)}
        trip={selectedTrip}
        mode={modalMode}
        onSave={handleSaveTrip}
      />
    </div>
  );
};

export default Dashboard;
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTrips } from '../hooks/useTrips';
import { 
  LogOut, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  Plane,
  Bot,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Trip } from '../lib/supabase';
import TripModal from './TripModal';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { trips, loading, createTrip, updateTrip, deleteTrip } = useTrips();
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCreateTrip = () => {
    setSelectedTrip(null);
    setModalMode('create');
    setShowTripModal(true);
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

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      await deleteTrip(tripId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-full p-2 mr-3">
                  <Plane size={24} className="text-white" />
                </div>
                <div className="bg-orange-500 rounded-full p-2 mr-4">
                  <Bot size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wanderwise</h1>
                <p className="text-sm text-gray-600">Your AI-Powered Travel Companion</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-semibold text-gray-900">{trips.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planning</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {trips.filter(trip => trip.status === 'planning').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plane className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {trips.filter(trip => trip.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {trips.filter(trip => trip.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trips Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Your Trips</h2>
              <button
                onClick={handleCreateTrip}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                New Trip
              </button>
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No trips yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first trip.</p>
              <div className="mt-6">
                <button
                  onClick={handleCreateTrip}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  New Trip
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {trips.map((trip) => (
                <div key={trip.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{trip.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-1" />
                          {trip.destination}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </div>
                        <div className="flex items-center">
                          <Users size={16} className="mr-1" />
                          {trip.travelers_count} {trip.travelers_count === 1 ? 'traveler' : 'travelers'}
                        </div>
                        {trip.budget && (
                          <div className="flex items-center">
                            <DollarSign size={16} className="mr-1" />
                            ${trip.budget.toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500 capitalize">
                        {trip.trip_type} trip
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewTrip(trip)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View trip"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditTrip(trip)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Edit trip"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete trip"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Trip Modal */}
      {showTripModal && (
        <TripModal
          isOpen={showTripModal}
          onClose={() => setShowTripModal(false)}
          trip={selectedTrip}
          mode={modalMode}
          onSave={modalMode === 'create' ? createTrip : updateTrip}
        />
      )}
    </div>
  );
};

export default Dashboard;
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
  Eye,
  TrendingUp,
  Clock,
  Star,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Trip } from '../lib/supabase';
import TripModal from './TripModal';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { trips, loading, createTrip, updateTrip, deleteTrip } = useTrips();
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock size={14} />;
      case 'confirmed': return <Star size={14} />;
      case 'completed': return <TrendingUp size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilTrip = (startDate: string) => {
    const today = new Date();
    const tripDate = new Date(startDate);
    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || trip.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
  const upcomingTrips = trips.filter(trip => {
    const daysUntil = getDaysUntilTrip(trip.start_date);
    return daysUntil > 0 && trip.status !== 'completed';
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your travel dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
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
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                <Bell size={20} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.email?.split('@')[0]}
                  </span>
                  <MoreVertical size={16} />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0]}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings size={16} className="mr-3" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}! ✈️
          </h2>
          <p className="text-gray-600">
            Ready to plan your next adventure? Let's make it unforgettable.
          </p>
        </div>

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
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {upcomingTrips.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
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

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready for your next adventure?</h3>
              <p className="text-blue-100">Let AI help you plan the perfect trip tailored to your preferences.</p>
            </div>
            <button
              onClick={handleCreateTrip}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
            >
              <Bot size={20} className="mr-2" />
              Plan with AI
            </button>
          </div>
        </div>

        {/* Trips Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Your Trips</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search trips..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={handleCreateTrip}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  New Trip
                </button>
              </div>
            </div>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              {trips.length === 0 ? (
                <>
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
                  <p className="text-gray-500 mb-6">Get started by creating your first trip with AI assistance.</p>
                </>
              ) : (
                <>
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
                </>
              )}
              <div className="mt-6">
                <button
                  onClick={handleCreateTrip}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Bot size={20} className="mr-2" />
                  Plan Your First Trip
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTrips.map((trip) => {
                const daysUntil = getDaysUntilTrip(trip.start_date);
                return (
                <div key={trip.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900 mr-3">{trip.title}</h3>
                          {daysUntil > 0 && daysUntil <= 30 && trip.status !== 'completed' && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              {daysUntil} days to go
                            </span>
                          )}
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center ${getStatusColor(trip.status)}`}>
                          {getStatusIcon(trip.status)}
                          <span className="ml-1">{trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}</span>
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
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 capitalize">
                          {trip.trip_type} trip
                        </p>
                        {daysUntil < 0 && trip.status !== 'completed' && (
                          <span className="text-xs text-red-600">Trip has passed</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewTrip(trip)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View trip"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditTrip(trip)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit trip"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete trip"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
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

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Users, DollarSign, Plane } from 'lucide-react';
import { Trip } from '../lib/supabase';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: Trip | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (tripData: any) => Promise<{ data: any; error: string | null }>;
}

const TripModal: React.FC<TripModalProps> = ({ isOpen, onClose, trip, mode, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    travelers_count: 1,
    trip_type: 'leisure',
    status: 'planning' as const,
    preferences: {},
    itinerary: {}
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (trip && (mode === 'edit' || mode === 'view')) {
      setFormData({
        title: trip.title,
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        budget: trip.budget?.toString() || '',
        travelers_count: trip.travelers_count,
        trip_type: trip.trip_type,
        status: trip.status,
        preferences: trip.preferences || {},
        itinerary: trip.itinerary || {}
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        destination: '',
        start_date: '',
        end_date: '',
        budget: '',
        travelers_count: 1,
        trip_type: 'leisure',
        status: 'planning',
        preferences: {},
        itinerary: {}
      });
    }
  }, [trip, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'travelers_count' ? parseInt(value) || 1 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    
    if (formData.travelers_count < 1) {
      newErrors.travelers_count = 'At least 1 traveler is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    const tripData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null
    };
    
    try {
      let result;
      if (mode === 'edit' && trip) {
        // For edit mode, only send the fields that can be updated
        const updateData = {
          title: tripData.title,
          destination: tripData.destination,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          budget: tripData.budget,
          travelers_count: tripData.travelers_count,
          trip_type: tripData.trip_type,
          status: tripData.status,
          preferences: tripData.preferences,
          itinerary: tripData.itinerary
        };
        result = await onSave(trip.id, updateData);
      } else {
        // For create mode, send all data
        result = await onSave(tripData);
      }
      
      if (result.error) {
        console.error('Save error:', result.error);
        setErrors({ submit: result.error });
      } else {
        console.log('Trip saved successfully:', result.data);
        onClose();
      }
    } catch (err) {
      console.error('Unexpected error during save:', err);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Create New Trip' : mode === 'edit' ? 'Edit Trip' : 'Trip Details';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-pink-900/95 backdrop-blur-xl rounded-lg shadow-2xl border border-purple-500/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trip Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-purple-200 mb-2">
              Trip Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 bg-white/10 border rounded-md text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-purple-400/30'
              } ${isReadOnly ? 'bg-black/20' : ''}`}
              placeholder="e.g., Summer Vacation in Europe"
            />
            {errors.title && <p className="text-pink-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Destination */}
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-purple-200 mb-2">
              <MapPin size={16} className="inline mr-1 text-purple-300" />
              Destination
            </label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 bg-white/10 border rounded-md text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                errors.destination ? 'border-red-500' : 'border-purple-400/30'
              } ${isReadOnly ? 'bg-black/20' : ''}`}
              placeholder="e.g., Paris, France"
            />
            {errors.destination && <p className="text-pink-400 text-sm mt-1">{errors.destination}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-purple-200 mb-2">
                <Calendar size={16} className="inline mr-1 text-purple-300" />
                Start Date
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 bg-white/10 border rounded-md text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                  errors.start_date ? 'border-red-500' : 'border-purple-400/30'
                } ${isReadOnly ? 'bg-black/20' : ''}`}
              />
              {errors.start_date && <p className="text-pink-400 text-sm mt-1">{errors.start_date}</p>}
            </div>
            
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-purple-200 mb-2">
                <Calendar size={16} className="inline mr-1 text-purple-300" />
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 bg-white/10 border rounded-md text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                  errors.end_date ? 'border-red-500' : 'border-purple-400/30'
                } ${isReadOnly ? 'bg-black/20' : ''}`}
              />
              {errors.end_date && <p className="text-pink-400 text-sm mt-1">{errors.end_date}</p>}
            </div>
          </div>

          {/* Budget and Travelers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-purple-200 mb-2">
                <DollarSign size={16} className="inline mr-1 text-purple-300" />
                Budget (Optional)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 bg-white/10 border rounded-md text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                  errors.budget ? 'border-red-500' : 'border-purple-400/30'
                } ${isReadOnly ? 'bg-black/20' : ''}`}
                placeholder="e.g., 2000"
                min="0"
                step="0.01"
              />
              {errors.budget && <p className="text-pink-400 text-sm mt-1">{errors.budget}</p>}
            </div>
            
            <div>
              <label htmlFor="travelers_count" className="block text-sm font-medium text-purple-200 mb-2">
                <Users size={16} className="inline mr-1 text-purple-300" />
                Number of Travelers
              </label>
              <input
                type="number"
                id="travelers_count"
                name="travelers_count"
                value={formData.travelers_count}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 bg-white/10 border rounded-md text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                  errors.travelers_count ? 'border-red-500' : 'border-purple-400/30'
                } ${isReadOnly ? 'bg-black/20' : ''}`}
                min="1"
              />
              {errors.travelers_count && <p className="text-pink-400 text-sm mt-1">{errors.travelers_count}</p>}
            </div>
          </div>

          {/* Trip Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="trip_type" className="block text-sm font-medium text-purple-200 mb-2">
                <Plane size={16} className="inline mr-1 text-purple-300" />
                Trip Type
              </label>
              <select
                id="trip_type"
                name="trip_type"
                value={formData.trip_type}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 bg-white/10 border rounded-md text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                  isReadOnly ? 'bg-black/20' : ''
                } border-purple-400/30`}
              >
                <option value="leisure">Leisure</option>
                <option value="business">Business</option>
                <option value="adventure">Adventure</option>
                <option value="family">Family</option>
                <option value="romantic">Romantic</option>
                <option value="solo">Solo</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-purple-200 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 bg-white/10 border rounded-md text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent ${
                  isReadOnly ? 'bg-black/20' : ''
                } border-purple-400/30`}
              >
                <option value="planning">Planning</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {errors.submit && (
            <div className="text-pink-400 text-sm">{errors.submit}</div>
          )}

          {/* Actions */}
          {!isReadOnly && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-purple-500/30">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 rounded-md transition-colors border border-purple-400/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === 'create' ? 'Creating...' : 'Saving...'}
                  </div>
                ) : (
                  mode === 'create' ? 'Create Trip' : 'Save Changes'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TripModal;
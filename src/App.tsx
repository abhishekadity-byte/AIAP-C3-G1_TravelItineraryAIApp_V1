import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading JourneyVerse...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginPage />;
}

export default App;
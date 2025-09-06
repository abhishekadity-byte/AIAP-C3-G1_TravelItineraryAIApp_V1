import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Plane, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          setError('Account created successfully! Please sign in.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Hero Image */}
        <div className="hidden lg:block relative">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
              alt="Beautiful travel destination with mountains and adventure"
              className="w-full h-[600px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-2xl font-bold mb-2">Discover Amazing Destinations</h3>
              <p className="text-purple-200">Let AI help you plan your perfect adventure</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-purple-500/30">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 shadow-2xl">
                  <Plane size={32} className="text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">JourneyVerse</h1>
              <p className="text-purple-200">Transform the way you travel with personalized adventures</p>
            </div>

            {/* Toggle */}
            <div className="flex bg-purple-500/20 rounded-lg p-1 mb-6 border border-purple-400/30">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Welcome Back
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isLogin
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-purple-200 hover:text-white'
                }`}
              >
                Join Us
              </button>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {isLogin ? 'Sign in to plan your next adventure' : 'Create your account to get started'}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-purple-200 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center text-purple-200">
                    <input type="checkbox" className="mr-2 rounded border-purple-400/30 bg-white/10" />
                    Remember me
                  </label>
                  <button type="button" className="text-purple-300 hover:text-purple-200 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="text-pink-400 text-sm text-center bg-pink-500/10 border border-pink-400/30 rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Sparkles size={20} className="mr-2" />
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-purple-200 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-300 hover:text-white font-medium transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-purple-500/30 text-center">
              <div className="flex justify-center space-x-4 mb-4">
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <Sparkles size={16} className="text-purple-300" />
                </div>
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <Plane size={16} className="text-purple-300" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">JourneyVerse</h3>
              <p className="text-purple-300 text-sm leading-relaxed">
                Your Perfect Journey Starts Here
              </p>
              <p className="text-purple-400 text-xs mt-2">
                Discover amazing destinations, plan unforgettable experiences, and create memories that last a lifetime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
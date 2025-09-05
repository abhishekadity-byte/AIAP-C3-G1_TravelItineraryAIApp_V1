import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Plane, MapPin, Compass, Bot } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

const LoginPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      let result;
      if (isSignupMode) {
        result = await signUp(formData.email, formData.password, formData.fullName);
      } else {
        result = await signIn(formData.email, formData.password);
      }
      
      if (result.error) {
        setErrors({ submit: result.error.message });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors] || errors.submit) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
        submit: undefined
      }));
    }
  };

  const handleSignupClick = () => {
    setIsSignupMode(!isSignupMode);
    setFormData({ email: '', password: '', fullName: '', rememberMe: false });
    setErrors({});
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
    alert('Forgot password functionality would be implemented here');
  };

  const handleSocialLogin = (provider: string) => {
    // Handle social login logic here
    alert(`${provider} login functionality would be implemented here`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 animate-float">
          <Plane size={24} className="text-white" />
        </div>
        <div className="absolute top-40 right-32 animate-float-delay">
          <MapPin size={20} className="text-white" />
        </div>
        <div className="absolute bottom-32 left-16 animate-float">
          <Compass size={28} className="text-white" />
        </div>
        <div className="absolute bottom-20 right-20 animate-float-delay">
          <Plane size={32} className="text-white transform rotate-45" />
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-3">
              <Plane size={32} className="text-white" />
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Bot size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Wanderwise</h1>
          <p className="text-blue-100 text-lg">Wandering with Wisdom your AI-Powered Travel companion</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {isSignupMode ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-blue-100">
                {isSignupMode ? 'Join us to start planning amazing trips' : 'Sign in to plan your next adventure'}
              </p>
            </div>

            {/* Full Name Field (only for signup) */}
            {isSignupMode && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-white">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 bg-white/20 backdrop-blur-sm border rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-400' : 'border-white/30'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-12 py-3 bg-white/20 backdrop-blur-sm border rounded-lg text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-400' : 'border-white/30'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-300 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-white/20 border-white/30 rounded focus:ring-blue-300 focus:ring-2"
                />
                <span className="ml-2 text-sm text-blue-100">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-orange-300 hover:text-orange-200 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-400 text-red-300 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-orange-300 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                isSignupMode ? 'Create Account' : 'Sign In'
              )}
            </button>

            {/* Social Login */}
            <div className="text-center mt-8">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-lg font-medium hover:bg-white/20 focus:ring-2 focus:ring-blue-300 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Google'
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                className="w-full bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-lg font-medium hover:bg-white/20 focus:ring-2 focus:ring-blue-300 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Facebook'
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-blue-100">
                {isSignupMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={handleSignupClick}
                  className="text-orange-300 hover:text-orange-200 font-medium transition-colors"
                >
                  {isSignupMode ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            Discover amazing destinations with AI-powered recommendations
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-delay {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float-delay 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
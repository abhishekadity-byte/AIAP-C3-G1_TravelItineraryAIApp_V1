import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Plane, MapPin, Calendar, Users, DollarSign, Sparkles, Loader } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (tripData: any) => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, onCreateTrip }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi there! 👋 I'm your AI travel assistant. I'm here to help you plan the perfect trip! Let's start by telling me where you'd like to go or what kind of experience you're looking for.",
      timestamp: new Date(),
      suggestions: [
        "I want to visit Europe for 2 weeks",
        "Plan a romantic getaway",
        "Adventure trip for solo traveler",
        "Family vacation with kids"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tripData, setTripData] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateAIResponse = (userMessage: string): { content: string; suggestions?: string[] } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Destination detection
    if (lowerMessage.includes('europe') || lowerMessage.includes('paris') || lowerMessage.includes('london')) {
      return {
        content: "Europe sounds amazing! 🇪🇺 I can help you plan an incredible European adventure. What's your budget range and how many days are you thinking? Also, are you more interested in historic cities, scenic countryside, or vibrant nightlife?",
        suggestions: [
          "Budget around $3000 for 10 days",
          "I love historic cities and museums",
          "Mix of cities and countryside",
          "Traveling with my partner"
        ]
      };
    }
    
    if (lowerMessage.includes('asia') || lowerMessage.includes('japan') || lowerMessage.includes('thailand')) {
      return {
        content: "Asia is such a diverse and exciting destination! 🌏 Are you drawn to the cultural richness of Japan, the tropical beaches of Thailand, or perhaps the bustling cities of Singapore? What type of experiences are you most excited about?",
        suggestions: [
          "Cultural experiences and temples",
          "Beach relaxation and water sports",
          "Street food and local markets",
          "Modern cities and technology"
        ]
      };
    }
    
    // Trip type detection
    if (lowerMessage.includes('romantic') || lowerMessage.includes('honeymoon') || lowerMessage.includes('couple')) {
      return {
        content: "A romantic getaway sounds wonderful! 💕 I can suggest some incredibly romantic destinations. Are you thinking of a cozy mountain retreat, a tropical beach paradise, or perhaps a charming European city with candlelit dinners?",
        suggestions: [
          "Tropical beach with overwater bungalows",
          "Cozy mountain cabin retreat",
          "European city with wine and dining",
          "Luxury spa resort"
        ]
      };
    }
    
    if (lowerMessage.includes('adventure') || lowerMessage.includes('hiking') || lowerMessage.includes('outdoor')) {
      return {
        content: "An adventure trip! 🏔️ That's exciting! Are you interested in mountain hiking, water sports, wildlife safaris, or extreme sports? And what's your experience level with outdoor activities?",
        suggestions: [
          "Mountain hiking and camping",
          "Scuba diving and water sports",
          "Wildlife safari in Africa",
          "Rock climbing and extreme sports"
        ]
      };
    }
    
    if (lowerMessage.includes('family') || lowerMessage.includes('kids') || lowerMessage.includes('children')) {
      return {
        content: "A family vacation! 👨‍👩‍👧‍👦 How wonderful! How many family members and what are the ages of the kids? This will help me suggest the perfect family-friendly destinations and activities.",
        suggestions: [
          "2 adults, 2 kids (ages 8 and 12)",
          "Theme parks and entertainment",
          "Educational and cultural sites",
          "Beach resort with kids' activities"
        ]
      };
    }
    
    // Budget-related responses
    if (lowerMessage.includes('budget') || lowerMessage.includes('$') || lowerMessage.includes('cost')) {
      return {
        content: "Great! Knowing your budget helps me tailor the perfect recommendations. Based on what you've told me, I can suggest accommodations, activities, and dining options that fit your budget. When are you planning to travel?",
        suggestions: [
          "Next month",
          "Summer vacation (June-August)",
          "Winter holidays (December)",
          "Flexible with dates"
        ]
      };
    }
    
    // Duration-related responses
    if (lowerMessage.includes('days') || lowerMessage.includes('week') || lowerMessage.includes('month')) {
      return {
        content: "Perfect! With that timeframe, we can create a well-paced itinerary. Let me gather a few more details to create your personalized trip plan. What's most important to you - relaxation, cultural experiences, adventure, or a mix of everything?",
        suggestions: [
          "Relaxation and leisure",
          "Cultural immersion",
          "Adventure and activities",
          "Mix of everything"
        ]
      };
    }
    
    // Default responses for general queries
    const defaultResponses = [
      {
        content: "That sounds interesting! Tell me more about what you have in mind. What's your ideal destination, and what kind of experiences are you looking for?",
        suggestions: [
          "Beach vacation in the Caribbean",
          "Cultural tour of Southeast Asia",
          "European city hopping",
          "Mountain adventure in Colorado"
        ]
      },
      {
        content: "I'd love to help you plan that trip! To give you the best recommendations, could you tell me your preferred travel dates and budget range?",
        suggestions: [
          "Budget: $2000-3000",
          "Budget: $3000-5000",
          "Budget: $5000+",
          "I'm flexible with budget"
        ]
      },
      {
        content: "Excellent choice! Let me help you create an amazing itinerary. How many travelers will be joining you, and do you have any specific interests or must-see places?",
        suggestions: [
          "Solo traveler",
          "Couple's trip",
          "Group of friends (4-6 people)",
          "Family with children"
        ]
      }
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Check if we have enough information to create a trip
      checkForTripCreation(inputMessage);
    }, 1500);
  };

  const checkForTripCreation = (message: string) => {
    // Simple logic to detect if user has provided enough info
    const hasDestination = /europe|asia|america|africa|australia|paris|london|tokyo|thailand|bali|italy|spain|france|germany|japan|singapore|vietnam|cambodia|india|nepal|peru|brazil|argentina|chile|mexico|canada|usa|new york|california|florida|hawaii/i.test(message);
    const hasDuration = /\d+\s*(day|week|month)|week|month/i.test(message);
    const hasBudget = /\$\d+|budget|cheap|expensive|luxury|mid-range/i.test(message);

    if (hasDestination && (hasDuration || hasBudget)) {
      setTimeout(() => {
        const tripCreationMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: "🎉 Great! I have enough information to create a preliminary trip plan for you. Would you like me to create a trip in your dashboard with these details? You can always edit and refine it later!",
          timestamp: new Date(),
          suggestions: [
            "Yes, create the trip!",
            "Let me add more details first",
            "Show me the itinerary preview",
            "I want to change something"
          ]
        };
        setMessages(prev => [...prev, tripCreationMessage]);
      }, 2000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSendMessage();
  };

  const handleCreateTripFromChat = () => {
    // Extract information from chat to create trip
    const chatContent = messages.map(m => m.content).join(' ');
    
    // Simple extraction logic (in a real app, you'd use more sophisticated NLP)
    const extractedData = {
      title: "AI Planned Trip",
      destination: "Europe", // This would be extracted from chat
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      end_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 40 days from now
      budget: 3000,
      travelers_count: 2,
      trip_type: 'leisure',
      status: 'planning' as const,
      preferences: {
        chatHistory: messages,
        aiGenerated: true
      },
      itinerary: {
        generatedByAI: true,
        chatSummary: "Trip planned through AI chat assistant"
      }
    };

    onCreateTrip(extractedData);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-3">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Travel Assistant</h2>
              <p className="text-blue-100 text-sm">Let's plan your perfect trip together!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                }`}>
                  {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`rounded-lg p-4 ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border shadow-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-600 font-medium">Quick suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-white border shadow-sm rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Loader className="animate-spin" size={16} />
                    <p className="text-sm text-gray-600">AI is thinking...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4 bg-white rounded-b-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me about your dream trip..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                disabled={isTyping}
              />
              <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleSuggestionClick("I want to visit Europe for 2 weeks")}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              <MapPin size={12} className="inline mr-1" />
              Europe Trip
            </button>
            <button
              onClick={() => handleSuggestionClick("Plan a romantic getaway for 2 people")}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              💕 Romantic
            </button>
            <button
              onClick={() => handleSuggestionClick("Adventure trip for solo traveler")}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              🏔️ Adventure
            </button>
            <button
              onClick={() => handleSuggestionClick("Family vacation with kids")}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              👨‍👩‍👧‍👦 Family
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
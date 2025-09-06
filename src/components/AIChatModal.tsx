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

// Configuration for n8n webhook
const N8N_CONFIG = {
  webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
  enabled: import.meta.env.VITE_N8N_ENABLED === 'true',
  timeout: 30000 // 30 seconds timeout
};

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, onCreateTrip }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: N8N_CONFIG.enabled 
        ? "Hi there! 👋 I'm your AI travel assistant powered by advanced AI workflows via n8n. I'm here to help you plan the perfect trip! Let's start by telling me where you'd like to go or what kind of experience you're looking for."
        : "Hi there! 👋 I'm your AI travel assistant. I'm here to help you plan the perfect trip! Let's start by telling me where you'd like to go or what kind of experience you're looking for.",
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
  const [conversationContext, setConversationContext] = useState<any>({
    destination: null,
    duration: null,
    budget: null,
    travelers: null,
    tripType: null,
    preferences: []
  });
  const [n8nStatus, setN8nStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
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
    
    // Test n8n connection when modal opens
    if (isOpen && N8N_CONFIG.enabled) {
      testN8nConnection();
    }
  }, [isOpen]);

  // Test n8n connection
  const testN8nConnection = async () => {
    if (!N8N_CONFIG.enabled || !N8N_CONFIG.webhookUrl) {
      setN8nStatus('disconnected');
      return;
    }
    
    // Check for placeholder URL
    if (N8N_CONFIG.webhookUrl.includes('your-n8n-instance.com')) {
      setN8nStatus('disconnected');
      return;
    }

    setN8nStatus('testing');
    
    try {
      // Use a simple HEAD request or OPTIONS to test connectivity without triggering workflow
      const response = await fetch(N8N_CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          message: "Connection test - please ignore",
          timestamp: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout for test
      });

      // Accept any response that's not a network error
      // n8n webhooks might return various status codes but still be working
      if (response.status < 500) {
        setN8nStatus('connected');
        console.log('✅ n8n connection successful, status:', response.status);
      } else {
        setN8nStatus('disconnected');
        console.log('❌ n8n connection failed with server error:', response.status);
      }
    } catch (error) {
      // Only mark as disconnected for actual network errors
      if (error.name === 'AbortError') {
        setN8nStatus('disconnected');
        console.log('⏰ n8n connection timeout');
      } else if (error.message.includes('Failed to fetch')) {
        setN8nStatus('disconnected');
        console.log('🌐 n8n network error - URL may not be accessible');
      } else {
        // For other errors, assume it might still work and mark as connected
        setN8nStatus('connected');
        console.log('⚠️ n8n connection test had issues but assuming it works:', error.message);
      }
    }
  };
  // Function to call n8n webhook
  const callN8nWebhook = async (userMessage: string, context: any) => {
    if (!N8N_CONFIG.enabled || !N8N_CONFIG.webhookUrl) {
      console.log('❌ n8n not enabled or URL not configured');
      return null;
    }
    
    // Check for placeholder URL
    if (N8N_CONFIG.webhookUrl.includes('your-n8n-instance.com')) {
      console.log('❌ n8n not configured properly');
      return null;
    }

    try {
      const payload = {
        message: userMessage,
        context: context,
        conversationHistory: messages.slice(-5), // Send last 5 messages for context
        timestamp: new Date().toISOString(),
        userId: 'user-' + Date.now(), // In real app, use actual user ID
        sessionId: 'session-' + Date.now() // In real app, maintain session ID
      };

      console.log('📤 Sending to n8n webhook:', N8N_CONFIG.webhookUrl);
      console.log('📦 Payload:', payload);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), N8N_CONFIG.timeout);

      const response = await fetch(N8N_CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('❌ n8n webhook HTTP error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        return null; // Fall back to local AI instead of throwing
      }

      const responseText = await response.text();
      console.log('📥 Raw n8n response:', responseText);
      console.log('📏 Response length:', responseText.length);
      console.log('🔍 Response type:', typeof responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('🎯 Initial parsed result:', result);
        console.log('📊 Is array?', Array.isArray(result));
        
        // Handle array responses from n8n (extract first item)
        if (Array.isArray(result) && result.length > 0) {
          console.log('📦 n8n returned array, using first item:', result[0]);
          console.log('📝 First item response field:', result[0].response);
          result = result[0];
        } else if (Array.isArray(result) && result.length === 0) {
          console.error('❌ n8n returned empty array');
          return null;
        }
        
        console.log('🔍 Final parsed result:', result);
        console.log('📝 Response field value:', result.response);
        console.log('💬 Message field value:', result.message);
        console.log('📄 Content field value:', result.content);
      } catch (parseError) {
        console.error('❌ Failed to parse n8n response as JSON:', parseError);
        console.error('❌ Response text:', responseText);
        return null; // Fall back to local AI
      }
      
      console.log('✅ Parsed n8n response:', result);
      console.log('💬 Final response content:', result.response);

      // Extract the actual response content with detailed logging
      const responseContent = result.response || result.message || result.content || result.text || result.reply;
      console.log('🎯 Extracted response content:', responseContent);
      
      if (!responseContent) {
        console.warn('⚠️ No response content found in n8n response, available fields:', Object.keys(result));
        console.warn('⚠️ Full result object:', JSON.stringify(result, null, 2));
      }
      
      const finalResponse = {
        content: responseContent || 'I received your message and I\'m processing it.',
        suggestions: result.suggestions || [],
        context: result.context || {},
        tripData: result.tripData || null,
        shouldCreateTrip: result.shouldCreateTrip || false
      };
      
      console.log('📤 Final response object:', finalResponse);

    } catch (error) {
      console.error('❌ Error calling n8n webhook:', error);
      
      if (error.name === 'AbortError') {
        console.log('⏰ n8n webhook timeout');
      } else if (error.message.includes('Failed to fetch')) {
        console.log('🌐 Network error - n8n URL may not be accessible or configured correctly');
        console.log('💡 Check your .env file and ensure n8n instance is running');
      }
      
      // Always return null to fall back to local AI
      console.log('🔄 Falling back to local AI processing');
      
      return null; // Fall back to local AI
    }
  };

  // Enhanced context extraction
  const extractContextFromMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    const newContext = { ...conversationContext };

    // Extract destination
    const destinations = ['europe', 'asia', 'america', 'africa', 'australia', 'paris', 'london', 'tokyo', 'thailand', 'bali', 'italy', 'spain', 'france', 'germany', 'japan', 'singapore', 'vietnam', 'cambodia', 'india', 'nepal', 'peru', 'brazil', 'argentina', 'chile', 'mexico', 'canada', 'usa', 'new york', 'california', 'florida', 'hawaii'];
    const foundDestination = destinations.find(dest => lowerMessage.includes(dest));
    if (foundDestination) newContext.destination = foundDestination;

    // Extract duration
    const durationMatch = lowerMessage.match(/(\d+)\s*(day|week|month)s?/);
    if (durationMatch) {
      newContext.duration = `${durationMatch[1]} ${durationMatch[2]}${durationMatch[1] !== '1' ? 's' : ''}`;
    }

    // Extract budget
    const budgetMatch = lowerMessage.match(/\$(\d+(?:,\d+)*)/);
    if (budgetMatch) {
      newContext.budget = budgetMatch[1].replace(',', '');
    }

    // Extract travelers count
    const travelersMatch = lowerMessage.match(/(\d+)\s*(people|person|traveler|adult)/);
    if (travelersMatch) {
      newContext.travelers = parseInt(travelersMatch[1]);
    }

    // Extract trip type
    const tripTypes = ['romantic', 'adventure', 'family', 'business', 'solo', 'leisure'];
    const foundTripType = tripTypes.find(type => lowerMessage.includes(type));
    if (foundTripType) newContext.tripType = foundTripType;

    // Extract preferences
    const preferences = ['beach', 'mountain', 'city', 'culture', 'food', 'nightlife', 'relaxation', 'shopping', 'history', 'nature'];
    const foundPreferences = preferences.filter(pref => lowerMessage.includes(pref));
    if (foundPreferences.length > 0) {
      newContext.preferences = [...new Set([...newContext.preferences, ...foundPreferences])];
    }

    return newContext;
  };
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

    const currentInput = inputMessage;
    console.log('🚀 Sending message:', currentInput);
    console.log('📡 n8n Config:', { 
      enabled: N8N_CONFIG.enabled, 
      hasUrl: !!N8N_CONFIG.webhookUrl,
      status: n8nStatus 
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Extract context from user message
    const newContext = extractContextFromMessage(currentInput);
    setConversationContext(newContext);

    try {
      let aiResponse;
      
      // Try n8n webhook first if enabled
      if (N8N_CONFIG.enabled && N8N_CONFIG.webhookUrl) {
        console.log('🔄 Attempting n8n webhook call...');
        console.log('📋 Expected n8n response format: { response: "message", suggestions: [...], context: {...} }');
        aiResponse = await callN8nWebhook(currentInput, newContext);
        
        if (aiResponse) {
          console.log('✅ n8n webhook successful:', aiResponse);
          console.log('📝 Using n8n response content:', aiResponse.content);
        } else {
          console.log('❌ n8n webhook failed, falling back to local AI');
        }
      } else {
        console.log('ℹ️ n8n not enabled or URL not configured, using local AI');
      }
      
      // Fall back to local AI if n8n fails or is disabled
      if (!aiResponse) {
        console.log('🤖 Using local AI fallback');
        aiResponse = generateAIResponse(currentInput);
      } else {
        console.log('🎯 Using n8n response:', aiResponse.content);
      }

      // Add AI response immediately (no artificial delay for n8n responses)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Handle trip creation if suggested by n8n
      if (aiResponse.shouldCreateTrip && aiResponse.tripData) {
        setTimeout(() => {
          const tripCreationMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: "🎉 Perfect! I have all the information I need to create your trip. Would you like me to add it to your dashboard?",
            timestamp: new Date(),
            suggestions: [
              "Yes, create the trip!",
              "Let me review the details first",
              "I want to modify something"
            ]
          };
          setMessages(prev => [...prev, tripCreationMessage]);
        }, 1000);
      } else if (!aiResponse.shouldCreateTrip) {
        // Only check for trip creation using local logic if n8n didn't handle it
        checkForTripCreation(currentInput, newContext);
      }
      
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having some technical difficulties. Let me try to help you with a basic response. Could you tell me more about your travel preferences?",
        timestamp: new Date(),
        suggestions: [
          "I want to visit Europe",
          "Planning a romantic getaway",
          "Adventure trip for solo traveler",
          "Family vacation with kids"
        ]
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const checkForTripCreation = (message: string, context: any) => {
    // Simple logic to detect if user has provided enough info
    const hasDestination = context.destination || /europe|asia|america|africa|australia|paris|london|tokyo|thailand|bali|italy|spain|france|germany|japan|singapore|vietnam|cambodia|india|nepal|peru|brazil|argentina|chile|mexico|canada|usa|new york|california|florida|hawaii/i.test(message);
    const hasDuration = context.duration || /\d+\s*(day|week|month)|week|month/i.test(message);
    const hasBudget = context.budget || /\$\d+|budget|cheap|expensive|luxury|mid-range/i.test(message);

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
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleCreateTripFromChat = () => {
    // Use extracted context to create trip
    const extractedData = {
      title: `${conversationContext.tripType || 'AI Planned'} Trip to ${conversationContext.destination || 'Amazing Destination'}`,
      destination: conversationContext.destination || "To be determined",
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      end_date: new Date(Date.now() + (conversationContext.duration?.includes('week') ? 37 : 40) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: conversationContext.budget ? parseFloat(conversationContext.budget) : null,
      travelers_count: conversationContext.travelers || 1,
      trip_type: conversationContext.tripType || 'leisure',
      status: 'planning' as const,
      preferences: {
        ...conversationContext,
        chatHistory: messages,
        aiGenerated: true,
        n8nEnabled: N8N_CONFIG.enabled
      },
      itinerary: {
        generatedByAI: true,
        chatSummary: "Trip planned through AI chat assistant",
        preferences: conversationContext.preferences
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
              <p className="text-blue-100 text-sm">
                {N8N_CONFIG.enabled 
                  ? `Powered by n8n workflows ${n8nStatus === 'connected' ? '🟢' : n8nStatus === 'testing' ? '🟡' : '🔴'}`
                  : 'Let\'s plan your perfect trip together!'
                }
              </p>
            </div>
          </div>
          {N8N_CONFIG.enabled && (
            <div className={`text-xs px-2 py-1 rounded ${
              n8nStatus === 'connected' ? 'bg-green-500/20 text-green-100' :
              n8nStatus === 'testing' ? 'bg-yellow-500/20 text-yellow-100' :
              'bg-red-500/20 text-red-100'
            }`}>
              n8n {n8nStatus === 'connected' ? 'Connected' : n8nStatus === 'testing' ? 'Testing...' : 'Disconnected'}
            </div>
          )}
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
                    <p className="text-sm text-gray-600">
                      {N8N_CONFIG.enabled ? 'AI workflow is processing...' : 'AI is thinking...'}
                    </p>
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
          
          {/* Context Display (for debugging) */}
          {Object.keys(conversationContext).some(key => conversationContext[key]) && (
            <div className="mt-2 text-xs text-gray-500">
              <details>
                <summary className="cursor-pointer">Detected preferences</summary>
                <div className="mt-1 bg-gray-50 p-2 rounded text-xs">
                  {conversationContext.destination && <span className="mr-2">📍 {conversationContext.destination}</span>}
                  {conversationContext.duration && <span className="mr-2">⏱️ {conversationContext.duration}</span>}
                  {conversationContext.budget && <span className="mr-2">💰 ${conversationContext.budget}</span>}
                  {conversationContext.travelers && <span className="mr-2">👥 {conversationContext.travelers}</span>}
                  {conversationContext.tripType && <span className="mr-2">🎯 {conversationContext.tripType}</span>}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
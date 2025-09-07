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
  const [messages, setMessages] = useState<Message[]>([]);
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
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string>(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Configuration for n8n webhook - moved inside component to avoid initialization issues
  const getN8nConfig = () => ({
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || '',
    enabled: import.meta.env.VITE_N8N_ENABLED === 'true',
    timeout: 120000 // 2 minutes timeout for AI workflows
  });

  // Initialize chat session with welcome message
  const initializeChatSession = () => {
    if (!sessionInitialized) {
      const n8nConfig = getN8nConfig();
      const welcomeMessage: Message = {
        id: '1',
        type: 'ai',
        content: n8nConfig.enabled 
          ? "Hi there! 👋 I'm your AI travel assistant powered by advanced AI workflows via n8n. I'm here to help you plan the perfect trip! Let's start by telling me where you'd like to go or what kind of experience you're looking for."
          : "Hi there! 👋 I'm your AI travel assistant. I'm here to help you plan the perfect trip! Let's start by telling me where you'd like to go or what kind of experience you're looking for.",
        timestamp: new Date(),
        suggestions: [
          "I want to visit Europe for 2 weeks",
          "Plan a romantic getaway",
          "Adventure trip for solo traveler",
          "Family vacation with kids"
        ]
      };
      
      setMessages([welcomeMessage]);
      setSessionInitialized(true);
      console.log('🎯 Chat session initialized with ID:', sessionIdRef.current);
    }
  };

  // Reset session when modal is closed
  const resetChatSession = () => {
    setMessages([]);
    setInputMessage('');
    setIsTyping(false);
    setTripData({});
    setConversationContext({
      destination: null,
      duration: null,
      budget: null,
      travelers: null,
      tripType: null,
      preferences: []
    });
    setSessionInitialized(false);
    sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔄 Chat session reset, new session ID:', sessionIdRef.current);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Initialize session when modal opens
      initializeChatSession();
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
    } else {
      // Reset session when modal closes
      resetChatSession();
    }
  }, [isOpen]);

  // Function to call n8n webhook
  const callN8nWebhook = async (userMessage: string, context: any) => {
    const n8nConfig = getN8nConfig();
    
    console.log('📡 Starting n8n webhook call for message:', userMessage);
    console.log('🔧 n8nConfig:', n8nConfig);
    
    if (!n8nConfig.enabled || !n8nConfig.webhookUrl) {
      console.log('❌ n8n not enabled or URL not configured:', {
        enabled: n8nConfig.enabled,
        hasUrl: !!n8nConfig.webhookUrl,
        url: n8nConfig.webhookUrl
      });
      return null;
    }
    
    // Check for placeholder URL
    if (n8nConfig.webhookUrl.includes('your-n8n-instance.com') || n8nConfig.webhookUrl.includes('your-ngrok-url')) {
      console.log('❌ n8n URL contains placeholder text, not configured properly');
      return null;
    }

    console.log('🚀 n8n webhook URL validated, making request...');

    try {
      const payload = {
        message: userMessage,
        context: context,
        conversationHistory: messages.slice(-5), // Send last 5 messages for context
        timestamp: new Date().toISOString(),
        userId: 'user-' + Date.now(), // In real app, use actual user ID
        sessionId: sessionIdRef.current // Use persistent session ID
      };

      console.log('📤 Sending payload to n8n webhook:', n8nConfig.webhookUrl, payload);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), n8nConfig.timeout);

      console.log('⏳ Waiting for n8n workflow response...');
      const response = await fetch(n8nConfig.webhookUrl, {
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
        console.error('❌ n8n webhook HTTP error details:', response.status, response.statusText, response.url);
        console.error('❌ n8n webhook HTTP error:', response.status, response.statusText);
        return null; // Fall back to local AI instead of throwing
      }

      console.log('✅ n8n workflow HTTP response received, parsing...');
      const responseText = await response.text();
      console.log('📥 n8n workflow response parsed, length:', responseText.length);
      console.log('📄 Full n8n response text:', responseText);
      console.log('📄 Raw n8n response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('🔍 Parsed JSON result:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse n8n response as JSON:', parseError);
        return null; // Fall back to local AI
      }
      
      // Handle array responses from n8n (extract first item)
      if (Array.isArray(result) && result.length > 0) {
        console.log('📦 n8n returned array, using first item');
        result = result[0];
        
        // Check if the array item has an 'output' field
        if (result && result.output) {
          console.log('🎯 Found output field in array item, using it');
          result = result.output;
        }
      } else if (Array.isArray(result) && result.length === 0) {
        console.error('❌ n8n returned empty array');
        return null;
      }
      
      // Extract response content - handle multiple possible formats
      let responseContent = null;
      let suggestions = [];
      let context = {};
      let tripData = null;
      let shouldCreateTrip = false;
      
      // First, try to get the response from common fields
      responseContent = result.response || result.message || result.content || result.text || result.reply;
      suggestions = result.suggestions || [];
      context = result.context || {};
      tripData = result.tripData || null;
      shouldCreateTrip = result.shouldCreateTrip || false;
      
      // If response content is a JSON string, parse it
      if (responseContent && typeof responseContent === 'string') {
        // Check if it's a JSON string
        if (responseContent.trim().startsWith('{') && responseContent.trim().endsWith('}')) {
          try {
            console.log('🔍 Response content appears to be JSON string, parsing...');
            const parsedContent = JSON.parse(responseContent);
            console.log('✅ Successfully parsed response content JSON:', parsedContent);
            
            // Extract from parsed content
            responseContent = parsedContent.response || parsedContent.message || parsedContent.content || parsedContent.text || parsedContent.reply || responseContent;
            suggestions = parsedContent.suggestions || suggestions;
            context = parsedContent.context || context;
            tripData = parsedContent.tripData || tripData;
            shouldCreateTrip = parsedContent.shouldCreateTrip || shouldCreateTrip;
          } catch (parseError) {
            console.log('📝 Response content is not valid JSON, using as plain text');
            // Keep the original responseContent as is
          }
        }
        
        // If still looks like JSON but parsing failed, try regex extraction
        if (!responseContent || responseContent.includes('"response"')) {
          console.log('🔧 Attempting regex extraction from response...');
          const responseMatch = responseContent.match(/"response":\s*"([^"]+)"/);
          const suggestionsMatch = responseContent.match(/"suggestions":\s*\[([^\]]+)\]/);
          
          if (responseMatch) {
            responseContent = responseMatch[1];
            console.log('✅ Extracted response via regex:', responseContent);
          }
          
          if (suggestionsMatch) {
            try {
              const suggestionsStr = '[' + suggestionsMatch[1] + ']';
              suggestions = JSON.parse(suggestionsStr);
              console.log('✅ Extracted suggestions via regex:', suggestions);
            } catch (e) {
              console.log('❌ Failed to parse suggestions via regex');
            }
          }
        }
      }
      
      const finalResponse = {
        content: responseContent || "I'm here to help you plan your trip! Could you tell me more about what you have in mind?",
        suggestions: suggestions,
        context: context,
        tripData: tripData,
        shouldCreateTrip: shouldCreateTrip
      };
      
      console.log('✅ Final parsed response:', finalResponse);
      
      console.log('🎯 n8n workflow processing completed successfully');
      
      return finalResponse;
      

    } catch (error) {
      console.error('❌ Error calling n8n workflow:', error);
      
      if (error.name === 'AbortError') {
        console.log('⏰ n8n workflow timeout after', n8nConfig.timeout / 1000, 'seconds');
      } else if (error.message.includes('Failed to fetch')) {
        console.log('🌐 Network error - n8n URL may not be accessible');
      }
      
      // Log the full error for debugging
      console.error('❌ Full error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Always return null to fall back to local AI
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
      let aiResponse = null;
      const n8nConfig = getN8nConfig();
      
      // Try n8n webhook first if enabled
      console.log('🔍 Checking n8n configuration before call...');
      console.log('🔧 N8N enabled:', n8nConfig.enabled);
      console.log('🔧 N8N URL:', n8nConfig.webhookUrl);
      
      if (n8nConfig.enabled && n8nConfig.webhookUrl && !n8nConfig.webhookUrl.includes('your-')) {
        console.log('🔄 Attempting n8n webhook call...');
        console.log('⏳ Waiting for n8n workflow to complete (timeout: 2 minutes)...');
        aiResponse = await callN8nWebhook(currentInput, newContext);
        
        if (aiResponse) {
          console.log('✅ n8n workflow completed successfully');
          console.log('📋 AI Response from n8n:', aiResponse);
        } else {
          console.log('❌ n8n workflow failed or timed out, falling back to local AI');
        }
      } else {
        console.log('⚠️ n8n webhook call skipped due to configuration:', {
          enabled: n8nConfig.enabled,
          hasUrl: !!n8nConfig.webhookUrl,
          urlValid: n8nConfig.webhookUrl && !n8nConfig.webhookUrl.includes('your-')
        });
      }
      
      // Fall back to local AI if n8n fails or is disabled
      if (!aiResponse) {
        console.log('🤖 Using local AI fallback');
        const localResponse = generateAIResponse(currentInput);
        aiResponse = {
          content: localResponse.content,
          suggestions: localResponse.suggestions || [],
          context: {},
          tripData: null,
          shouldCreateTrip: false
        };
      }

      // Only add AI response after we have a complete response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions || []
      };

      setMessages(prev => [...prev, aiMessage]);

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
      }
      
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      
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
    } finally {
      // Always stop typing indicator
      setIsTyping(false);
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
        n8nEnabled: getN8nConfig().enabled
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
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <div className="flex items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-3">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Travel Assistant</h2>
              <p className="text-blue-100 text-sm">
                {getN8nConfig().enabled 
                  ? `Powered by n8n workflows • Session: ${sessionIdRef.current.split('-')[1]}`
                  : 'Let\'s plan your perfect trip together!'
                }
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-purple-900/50 via-purple-800/50 to-pink-900/50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                }`}>
                  {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`rounded-lg p-4 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'bg-black/40 backdrop-blur-xl border border-purple-500/30 text-white shadow-lg'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-purple-100' : 'text-purple-300'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-purple-300 font-medium">Quick suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full hover:bg-purple-500/30 transition-colors border border-purple-400/30"
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
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-lg">
                  <Bot size={16} />
                </div>
                <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-lg rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Loader className="animate-spin text-purple-400" size={16} />
                    <p className="text-sm text-purple-200">
                      {getN8nConfig().enabled ? 'AI workflow is processing...' : 'AI is thinking...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-purple-500/30 p-4 bg-black/20 backdrop-blur-xl rounded-b-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me about your dream trip..."
                className="w-full px-4 py-3 bg-white/90 border border-purple-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white pr-12 shadow-lg"
                disabled={isTyping}
              />
              <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={20} />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Send size={20} />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => handleSuggestionClick("I want to visit Europe for 2 weeks")}
              className="text-xs px-3 py-2 bg-white/90 text-purple-700 rounded-full hover:bg-white hover:text-purple-800 transition-colors border border-purple-300 shadow-md hover:shadow-lg font-medium"
            >
              <MapPin size={12} className="inline mr-1" />
              Europe Trip
            </button>
            <button
              onClick={() => handleSuggestionClick("Plan a romantic getaway for 2 people")}
              className="text-xs px-3 py-2 bg-white/90 text-pink-700 rounded-full hover:bg-white hover:text-pink-800 transition-colors border border-pink-300 shadow-md hover:shadow-lg font-medium"
            >
              💕 Romantic
            </button>
            <button
              onClick={() => handleSuggestionClick("Adventure trip for solo traveler")}
              className="text-xs px-3 py-2 bg-white/90 text-purple-700 rounded-full hover:bg-white hover:text-purple-800 transition-colors border border-purple-300 shadow-md hover:shadow-lg font-medium"
            >
              🏔️ Adventure
            </button>
            <button
              onClick={() => handleSuggestionClick("Family vacation with kids")}
              className="text-xs px-3 py-2 bg-white/90 text-pink-700 rounded-full hover:bg-white hover:text-pink-800 transition-colors border border-pink-300 shadow-md hover:shadow-lg font-medium"
            >
              👨‍👩‍👧‍👦 Family
            </button>
          </div>
          
          {/* Context Display (for debugging) */}
          {Object.keys(conversationContext).some(key => conversationContext[key]) && (
            <div className="mt-2 text-xs text-gray-500">
              <details>
                <summary className="cursor-pointer text-white bg-black/30 px-2 py-1 rounded">
                  Detected preferences • Session: {sessionIdRef.current.split('-')[1]}
                </summary>
                <div className="mt-1 bg-black/40 p-2 rounded text-xs text-white border border-purple-400/30">
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
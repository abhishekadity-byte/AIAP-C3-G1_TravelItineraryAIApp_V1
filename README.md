# JourneyVerse - AI Travel Itinerary App

An AI-powered travel planning application that helps users create personalized travel itineraries through intelligent conversation.

## Features

- 🤖 **AI Chat Assistant** - Interactive travel planning through natural conversation
- 🗺️ **Trip Management** - Create, edit, and manage travel itineraries
- 👤 **User Authentication** - Secure user accounts with Supabase
- 🔗 **n8n Integration** - Connect to advanced AI workflows (optional)
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database + Authentication)
- **AI Integration**: n8n workflows (optional)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd journeyverse
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Required: Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: n8n Integration
VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/travel-chat
VITE_N8N_ENABLED=true

# Other Configuration
VITE_APP_NAME=JourneyVerse
VITE_APP_VERSION=1.0.0
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the migrations in the `supabase/migrations` folder
3. Disable email confirmation in Authentication settings
4. Copy your project URL and anon key to `.env`

### 4. n8n Integration (Optional)

To connect with n8n for advanced AI capabilities:

#### n8n Workflow Setup

1. **Create a new workflow** in your n8n instance
2. **Add a Webhook node** as the trigger:
   - Method: POST
   - Path: `/webhook/travel-chat`
   - Response Mode: Respond to Webhook

3. **Expected Webhook Payload**:
```json
{
  "message": "I want to visit Europe for 2 weeks",
  "context": {
    "destination": "europe",
    "duration": "2 weeks",
    "budget": null,
    "travelers": null,
    "tripType": null,
    "preferences": []
  },
  "conversationHistory": [...],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "userId": "user-123",
  "sessionId": "session-456"
}
```

4. **Add AI Processing Nodes**:
   - **OpenAI/ChatGPT node** for intelligent responses
   - **HTTP Request nodes** for external APIs (weather, flights, hotels)
   - **Code nodes** for custom logic

5. **Response Format**:
```json
{
  "response": "Europe sounds amazing! I can help you plan...",
  "suggestions": [
    "Budget around $3000 for 10 days",
    "I love historic cities and museums"
  ],
  "context": {
    "destination": "europe",
    "duration": "2 weeks"
  },
  "tripData": {
    "title": "European Adventure",
    "destination": "Europe"
  },
  "shouldCreateTrip": false
}
```

#### Example n8n Workflow Nodes

1. **Webhook Trigger** → Receives chat messages
2. **OpenAI Chat** → Processes user intent and generates responses
3. **Switch Node** → Routes based on conversation stage
4. **HTTP Request** → Fetches travel data from APIs
5. **Code Node** → Formats response and determines next actions
6. **Respond to Webhook** → Sends response back to app

#### Advanced Features with n8n

- **Multi-language support** using translation APIs
- **Real-time flight prices** from airline APIs
- **Weather forecasts** for destinations
- **Hotel recommendations** from booking APIs
- **Currency conversion** and budget calculations
- **Visa requirements** checking
- **Travel alerts** and safety information

### 5. Development

```bash
npm run dev
```

### 6. Production Build

```bash
npm run build
npm run preview
```

## Architecture

### Frontend Components

- `LoginPage` - Authentication interface
- `Dashboard` - Main user interface with trip management
- `AIChatModal` - Interactive AI chat for trip planning
- `TripModal` - Trip creation and editing interface

### Backend Integration

- **Supabase**: Handles user authentication and data storage
- **n8n**: Processes AI conversations and external API integrations

### Data Flow

1. User interacts with AI chat
2. Messages sent to n8n webhook (if enabled)
3. n8n processes with AI and external APIs
4. Response sent back to frontend
5. Trip data stored in Supabase
6. Dashboard updated with new trips

## API Integration Examples

### Travel APIs you can integrate via n8n:

- **Amadeus** - Flights, hotels, car rentals
- **Skyscanner** - Flight search and prices
- **OpenWeatherMap** - Weather forecasts
- **REST Countries** - Country information
- **ExchangeRate-API** - Currency conversion
- **Visa List** - Visa requirements

### Sample n8n Workflow for Flight Search:

```
Webhook → Extract Destination → Amadeus API → Format Results → Respond
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_N8N_WEBHOOK_URL` | n8n webhook endpoint | No |
| `VITE_N8N_ENABLED` | Enable n8n integration | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
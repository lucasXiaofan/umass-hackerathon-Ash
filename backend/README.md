# Flask Backend API for Ash

This is the Flask backend API that powers the Ash chat assistant with voice capabilities.

## Features

- Chat message handling with AI responses
- Sprite state control (speaking/idle animations)
- Voice call integration (ElevenLabs TTS)
- File upload and processing for date extraction
- CORS-enabled for Next.js frontend

## Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
```

5. Run the Flask server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Chat
- `POST /api/chat` - Send chat message and receive AI response
- `GET /api/chat/history` - Get chat history

### Sprite Control
- `GET /api/sprite/status` - Get current sprite state
- `POST /api/sprite/speak` - Control sprite speaking animation

### Voice
- `POST /api/voice/start` - Start voice call
- `POST /api/voice/stop` - Stop voice call
- `POST /api/tts` - Convert text to speech

### File Upload
- `POST /api/upload` - Upload and process files for date extraction

### Health
- `GET /api/health` - Health check endpoint

## Development

To enable hot-reload during development, the server runs in debug mode by default. In production, set `debug=False`.

## Next Steps

1. Integrate OpenAI API for better chat responses
2. Integrate ElevenLabs API for voice synthesis
3. Implement date extraction from uploaded files
4. Add database for persistent chat history
5. Add authentication/user management

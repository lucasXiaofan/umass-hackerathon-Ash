from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import io
from werkzeug.utils import secure_filename
from openai import OpenAI

# Load environment variables
load_dotenv()

# Configure OpenRouter client
# model_name = "minimax/minimax-m2:free"
model_name = "deepseek/deepseek-chat-v3-0324"
model_name="google/gemini-2.5-flash-lite"
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'ics'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global state for sprite and voice
sprite_state = {
    'is_speaking': False,
    'is_on_call': False,
    'last_updated': datetime.now().isoformat()
}

# Chat history storage (in-memory, consider using a database for production)
chat_history = []

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_ai_response(user_input, history):
    """
    Generate AI response using OpenRouter API with minimax model.
    """
    try:
        # Build conversation history for context
        messages = [
            {
                "role": "system",
                "content": """You are Ash, a friendly and helpful personal assistant for students.
Your job is to help students manage their time, deadlines, and reminders in a casual, supportive way.
Be conversational, encouraging, and use phrases like "we got this!" and "I'm here to help".
Keep responses concise (3-5) sentences max) and actionable."""
            }
        ]

        # Add recent history for context (last 10 messages)
        for msg in history[-10:]:
            messages.append({
                "role": "user" if msg.get("is_user") else "assistant",
                "content": msg.get("message", "")
            })

        # Add current user input
        messages.append({
            "role": "user",
            "content": user_input
        })

        # Call OpenRouter API
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.7,
        )
        print(f"the input is {user_input} the history is {history}, current result from chat is {response.choices[0].message.content}")
        return response.choices[0].message.content

    except Exception as e:
        print(f"Error calling OpenRouter API: {e}")
        # Fallback response
        return "Hey! I'm having a bit of trouble right now, but I'm here to help. Can you try that again?"

# ============================================
# CHAT ENDPOINTS
# ============================================

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Handle chat messages from the frontend.
    Expected JSON: { "message": "user message", "user_id": "optional" }
    Returns: { "response": "AI response", "timestamp": "...", "should_speak": true }
    """
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        user_id = data.get('user_id', 'default_user')

        if not user_message:
            return jsonify({'error': 'No message provided'}), 400

        # Store user message in history
        chat_history.append({
            'user_id': user_id,
            'message': user_message,
            'is_user': True,
            'timestamp': datetime.now().isoformat()
        })

        # Generate AI response
        ai_response = get_ai_response(user_message, chat_history)

        # Store AI response in history
        chat_history.append({
            'user_id': user_id,
            'message': ai_response,
            'is_user': False,
            'timestamp': datetime.now().isoformat()
        })

        # Update sprite state to speaking
        sprite_state['is_speaking'] = True
        sprite_state['last_updated'] = datetime.now().isoformat()

        return jsonify({
            'response': ai_response,
            'timestamp': datetime.now().isoformat(),
            'should_speak': True
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    """
    Get chat history.
    Query params: user_id (optional), limit (optional)
    """
    try:
        user_id = request.args.get('user_id', None)
        limit = request.args.get('limit', 50, type=int)

        filtered_history = chat_history
        if user_id:
            filtered_history = [msg for msg in chat_history if msg.get('user_id') == user_id]

        return jsonify({
            'history': filtered_history[-limit:],
            'total': len(filtered_history)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# SPRITE CONTROL ENDPOINTS
# ============================================

@app.route('/api/sprite/status', methods=['GET'])
def get_sprite_status():
    """
    Get current sprite status.
    Returns: { "is_speaking": bool, "is_on_call": bool, "last_updated": "..." }
    """
    return jsonify(sprite_state), 200

@app.route('/api/sprite/speak', methods=['POST'])
def set_sprite_speaking():
    """
    Control sprite speaking state.
    Expected JSON: { "is_speaking": bool }
    """
    try:
        data = request.get_json()
        is_speaking = data.get('is_speaking', False)

        sprite_state['is_speaking'] = is_speaking
        sprite_state['last_updated'] = datetime.now().isoformat()

        return jsonify(sprite_state), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# VOICE ENDPOINTS
# ============================================

@app.route('/api/voice/start', methods=['POST'])
def start_voice_call():
    """
    Start voice call with ElevenLabs.
    Expected JSON: { "user_id": "optional" }
    """
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', 'default_user')

        # TODO: Initialize ElevenLabs voice call
        # This would involve setting up a WebSocket connection or streaming API

        sprite_state['is_on_call'] = True
        sprite_state['is_speaking'] = True
        sprite_state['last_updated'] = datetime.now().isoformat()

        return jsonify({
            'status': 'call_started',
            'message': 'Voice call started successfully',
            'sprite_state': sprite_state
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/stop', methods=['POST'])
def stop_voice_call():
    """
    Stop voice call.
    """
    try:
        # TODO: Close ElevenLabs voice call connection

        sprite_state['is_on_call'] = False
        sprite_state['is_speaking'] = False
        sprite_state['last_updated'] = datetime.now().isoformat()

        return jsonify({
            'status': 'call_ended',
            'message': 'Voice call ended successfully',
            'sprite_state': sprite_state
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    """
    Convert text to speech using ElevenLabs.
    Expected JSON: { "text": "text to convert" }
    Returns: Audio file stream
    """
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # TODO: Integrate with ElevenLabs API
        # Example (uncomment when API key is set):
        """
        from elevenlabs import generate, set_api_key

        set_api_key(os.getenv('ELEVENLABS_API_KEY'))

        audio = generate(
            text=text,
            voice=os.getenv('ELEVENLABS_VOICE_ID', 'default'),
            model="eleven_monolingual_v1"
        )

        # Return audio file
        return send_file(
            io.BytesIO(audio),
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name='speech.mp3'
        )
        """

        # For now, return success message
        sprite_state['is_speaking'] = True
        sprite_state['last_updated'] = datetime.now().isoformat()

        return jsonify({
            'status': 'tts_generated',
            'message': 'TTS generation would happen here',
            'text_length': len(text)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# FILE UPLOAD ENDPOINTS
# ============================================

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """
    Handle file upload and extract dates/deadlines.
    Expected: multipart/form-data with 'file' field
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # TODO: Process file to extract dates and create reminders
        # This would involve:
        # 1. Reading PDF/DOC/TXT content
        # 2. Using NLP to extract dates and deadlines
        # 3. Creating reminder entries

        extracted_info = {
            'filename': filename,
            'file_size': os.path.getsize(filepath),
            'file_type': filename.rsplit('.', 1)[1].lower(),
            'extracted_dates': [],  # TODO: Implement date extraction
            'message': f'File "{filename}" uploaded successfully and is being processed'
        }

        return jsonify(extracted_info), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'chat_history_count': len(chat_history)
    }), 200

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

/**
 * API service for communicating with the Flask backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

interface ChatResponse {
  response: string
  timestamp: string
  should_speak: boolean
}

interface SpriteState {
  is_speaking: boolean
  is_on_call: boolean
  last_updated: string
}

interface UploadResponse {
  filename: string
  file_size: number
  file_type: string
  extracted_dates: any[]
  message: string
}

/**
 * Chat API
 */
export const chatAPI = {
  /**
   * Send a chat message and get AI response
   */
  async sendMessage(message: string, userId?: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, user_id: userId }),
    })

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Get chat history
   */
  async getHistory(userId?: string, limit?: number): Promise<any> {
    const params = new URLSearchParams()
    if (userId) params.append('user_id', userId)
    if (limit) params.append('limit', limit.toString())

    const response = await fetch(`${API_BASE_URL}/chat/history?${params}`)

    if (!response.ok) {
      throw new Error(`Chat history API error: ${response.statusText}`)
    }

    return response.json()
  },
}

/**
 * Sprite Control API
 */
export const spriteAPI = {
  /**
   * Get current sprite status
   */
  async getStatus(): Promise<SpriteState> {
    const response = await fetch(`${API_BASE_URL}/sprite/status`)

    if (!response.ok) {
      throw new Error(`Sprite status API error: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Set sprite speaking state
   */
  async setSpeaking(isSpeaking: boolean): Promise<SpriteState> {
    const response = await fetch(`${API_BASE_URL}/sprite/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_speaking: isSpeaking }),
    })

    if (!response.ok) {
      throw new Error(`Sprite speak API error: ${response.statusText}`)
    }

    return response.json()
  },
}

/**
 * Voice API
 */
export const voiceAPI = {
  /**
   * Start voice call
   */
  async startCall(userId?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/voice/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    })

    if (!response.ok) {
      throw new Error(`Voice start API error: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Stop voice call
   */
  async stopCall(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/voice/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Voice stop API error: ${response.statusText}`)
    }

    return response.json()
  },

  /**
   * Convert text to speech
   */
  async textToSpeech(text: string): Promise<Blob | any> {
    const response = await fetch(`${API_BASE_URL}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`)
    }

    // Check if response is audio or JSON
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('audio')) {
      return response.blob()
    } else {
      return response.json()
    }
  },
}

/**
 * File Upload API
 */
export const uploadAPI = {
  /**
   * Upload file for processing
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload API error: ${response.statusText}`)
    }

    return response.json()
  },
}

/**
 * Health Check API
 */
export const healthAPI = {
  /**
   * Check API health
   */
  async check(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/health`)

    if (!response.ok) {
      throw new Error(`Health check API error: ${response.statusText}`)
    }

    return response.json()
  },
}

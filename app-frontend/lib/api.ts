// API Client for Londoolink AI Backend Connection
declare const process: { env: { NEXT_PUBLIC_API_BASE_URL?: string } }
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
if (typeof window !== 'undefined') {
  console.log('API Base URL:', API_BASE_URL)
}
const API_VERSION = "/api/v1"

// Utility function to decode HTML entities and clean up text
function decodeHtmlEntities(text: string): string {
  if (!text) return text

  const entities: { [key: string]: string } = {
    '&quot;': '"',
    '&#39;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' '
  }

  let decoded = text
  Object.entries(entities).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  })

  return decoded
}

// Utility function to format text for display
function formatTextForDisplay(text: string): string {
  if (!text) return text

  // First decode HTML entities
  let formatted = decodeHtmlEntities(text)

  // Clean up markdown formatting for better readability
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1')   // Remove italic markdown
    .replace(/#{1,6}\s/g, '')      // Remove markdown headers
    .replace(/^\s*[-*+]\s/gm, '• ') // Convert list markers to bullets
    .replace(/^\s*\d+\.\s/gm, '• ') // Convert numbered lists to bullets
    .trim()

  return formatted
}

interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  message?: string
  detail?: string
  access_token?: string
  token_type?: string
  briefing?: T
  [key: string]: any // Allow additional properties
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
  full_name?: string
  phone_number?: string
}

interface BackendBriefing {
  user_id: number
  generated_at: string
  email_insights: any
  calendar_insights: any
  social_insights: any
  priority_recommendations: any
  summary: string
  workflow_status: string
}

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    // Only access localStorage on client side
    const token = typeof window !== 'undefined' ? localStorage.getItem("londoolink_token") : null
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
      if (typeof window !== 'undefined') {
        console.log(`🚀 API POST ${endpoint} starting...`, data)
      }
      const response = await fetch(`${API_BASE_URL}${API_VERSION}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
        signal: controller.signal
      })

      clearTimeout(id)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      if (typeof window !== 'undefined') {
        console.log(`✅ API POST ${endpoint} success`)
      }
      return result
    } catch (error: any) {
      clearTimeout(id)
      if (error.name === 'AbortError') {
        console.error(`❌ API POST ${endpoint} TIMEOUT after 30s`)
        throw new Error('Request timed out. The server might be busy or unreachable.')
      }
      console.error(`❌ API POST ${endpoint} failed:`, error)
      throw error
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 30000) // 30s timeout

    try {
      if (typeof window !== 'undefined') {
        console.log(`🚀 API GET ${endpoint} starting...`)
      }
      const response = await fetch(`${API_BASE_URL}${API_VERSION}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: controller.signal
      })

      clearTimeout(id)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      if (typeof window !== 'undefined') {
        console.log(`✅ API GET ${endpoint} success`)
      }
      return result
    } catch (error: any) {
      clearTimeout(id)
      if (error.name === 'AbortError') {
        console.error(`❌ API GET ${endpoint} TIMEOUT after 30s`)
        throw new Error('Request timed out. The server might be busy or unreachable.')
      }
      console.error(`❌ API GET ${endpoint} failed:`, error)
      throw error
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse> {
    return this.post('/auth/login', credentials)
  }

  async register(userData: RegisterRequest): Promise<ApiResponse> {
    return this.post('/auth/register', userData)
  }

  // Agent methods
  async getDailyBriefing(): Promise<ApiResponse<BackendBriefing>> {
    return this.get('/agent/briefing/daily')
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.get('/agent/users/me')
  }

  async getHealthCheck(): Promise<ApiResponse> {
    return this.get('/agent/health')
  }

  async analyzeDocument(document: any): Promise<ApiResponse> {
    return this.post('/agent/analyze/document', document)
  }

  async searchRAG(query: string): Promise<ApiResponse> {
    return this.post('/agent/rag/search', { query })
  }

  async getRagStats(): Promise<ApiResponse> {
    return this.get('/agent/rag/stats')
  }

  // Chat with agents
  async chatWithAgent(agentType: string, message: string): Promise<ApiResponse> {
    // For general chat, use a different endpoint or agent type
    const endpoint = agentType === 'general' ? '/agent/chat' : '/agent/chat'
    const response = await this.post(endpoint, { agent_type: agentType, message })

    // Format the response message if it exists
    if (response.message) {
      response.message = formatTextForDisplay(response.message)
    }
    if (response.analysis) {
      response.analysis = formatTextForDisplay(response.analysis)
    }

    return response
  }

  // Get available agents
  async getAvailableAgents(): Promise<ApiResponse> {
    return this.get('/agent/list')
  }

  // Ingestion methods
  async ingestEmail(emailData: any): Promise<ApiResponse> {
    return this.post('/ingest/email', emailData)
  }

  async ingestCalendar(calendarData: any): Promise<ApiResponse> {
    return this.post('/ingest/calendar', calendarData)
  }

  async ingestGeneric(genericData: any): Promise<ApiResponse> {
    return this.post('/ingest/generic', genericData)
  }

  // Profile methods
  async getProfile(): Promise<ApiResponse> {
    return this.get('/profile/me')
  }

  async updateProfile(profileData: any): Promise<ApiResponse> {
    return this.post('/profile/me', profileData)
  }

  async deleteProfile(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}${API_VERSION}/profile/me`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return await response.json()
  }

  // Settings methods
  async getSettings(): Promise<ApiResponse> {
    return this.get('/settings')
  }

  async updateSettings(settingsData: any): Promise<ApiResponse> {
    return this.post('/settings', settingsData)
  }

  // Consent methods
  async getConsents(): Promise<ApiResponse> {
    return this.get('/consent')
  }

  async grantConsent(consentData: any): Promise<ApiResponse> {
    return this.post('/consent', consentData)
  }

  async revokeConsent(serviceType: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}${API_VERSION}/consent/${serviceType}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })
    return await response.json()
  }

  // Integration methods
  async getIntegrationsStatus(): Promise<ApiResponse> {
    return this.get('/integrations/status')
  }

  async getVaultHealth(): Promise<ApiResponse> {
    return this.get('/health/token-vault')
  }

  async getAuditLog(limit = 20): Promise<ApiResponse> {
    return this.get(`/audit?limit=${limit}`)
  }

  async connectEmail(provider: 'gmail' | 'outlook', authCode?: string): Promise<ApiResponse> {
    return this.post('/integrations/email/connect', {
      provider,
      authorization_code: authCode
    })
  }

  async disconnectEmail(): Promise<ApiResponse> {
    return this.post('/integrations/email/disconnect', {})
  }


  async connectSMS(provider: 'twilio' | 'messagebird', apiKey?: string, apiSecret?: string, phoneNumber?: string): Promise<ApiResponse> {
    return this.post('/integrations/sms/connect', {
      provider,
      api_key: apiKey,
      api_secret: apiSecret,
      phone_number: phoneNumber
    })
  }

  async disconnectSMS(): Promise<ApiResponse> {
    return this.post('/integrations/sms/disconnect', {})
  }

  // 2FA methods
  async get2FAStatus(): Promise<ApiResponse> {
    return this.get('/2fa/status')
  }

  async uploadProfilePicture(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem("londoolink_token")
    const response = await fetch(`${API_BASE_URL}${API_VERSION}/profile/picture`, {
      method: 'POST',
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || error.message || 'Failed to upload image')
    }

    return response.json()
  }

  async enable2FA(password: string): Promise<ApiResponse> {
    return this.post('/2fa/enable', { password })
  }

  async verify2FASetup(code: string): Promise<ApiResponse> {
    return this.post('/2fa/verify', { code })
  }

  async disable2FA(password: string, code: string): Promise<ApiResponse> {
    return this.post('/2fa/disable', { password, code })
  }

  async verify2FALogin(code: string): Promise<ApiResponse> {
    return this.post('/2fa/verify-login', { code })
  }
}

export const apiClient = new ApiClient()
export type { ApiResponse, BackendBriefing, LoginRequest, RegisterRequest }
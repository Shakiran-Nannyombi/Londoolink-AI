// API Client for Londoolink AI Backend Connection
declare const process: { env: { NEXT_PUBLIC_API_URL?: string } }
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  message?: string
  detail?: string
  access_token?: string
  token_type?: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
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
    const token = localStorage.getItem("londoolink_token")
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API POST ${endpoint} failed:`, error)
      throw error
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API GET ${endpoint} failed:`, error)
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
}

export const apiClient = new ApiClient()
export type { ApiResponse, BackendBriefing, LoginRequest, RegisterRequest }